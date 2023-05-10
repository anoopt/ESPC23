import * as React from 'react';
import { IThumbnailsProps } from './IThumbnailsProps';
import { ILexicaImages, ILexicaImage } from './ILexicaImage';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { thumbnailsStyles, loadingSpinnerStyles } from './styles';
import { isEmpty } from '@microsoft/sp-lodash-subset';
import { useAzureFunctions, useSharePointRest, useMicrosoftGraph } from '../../../hooks';
import { KEYWORDS_COLUMN_NAME, SITE_PAGES_LIBRARY_NAME, LEXCIA_SEARCH_ENDPIONT } from '../../../constants/constants';

const Thumbnails: React.FC<IThumbnailsProps> = (props) => {

  const [loading, setLoading] = React.useState<boolean>(true);
  const [thumbnails, setThumbnails] = React.useState<string[]>([]);

  const { aadHttpClientFactory, msGraphClientFactory, spHttpClient, siteId, pageId, siteUrl, pageItemId } = props;
  const { getKeywordsUsingOpenAI, updatePagePnPPowerShell } = useAzureFunctions(aadHttpClientFactory);
  const { callMicrosoftGraphAPI } = useMicrosoftGraph(msGraphClientFactory);
  const { getItem } = useSharePointRest(spHttpClient, siteUrl);

  const getThumbnailsFromLexicaUsingKeywords = async (keywords: string): Promise<void> => {

    // if keywords is empty, return
    if (isEmpty(keywords)) {
      return;
    }

    // get the thumbnails from the lexica using the keywords
    const thumbnailsFromLexica: string[] = [];

    try {
      const response = await fetch(`${LEXCIA_SEARCH_ENDPIONT}?q=${keywords}`);
      const data: ILexicaImages = await response.json();
      if (!isEmpty(data.images)) {
        // pick random 5 images from the lexica
        const randomImages: ILexicaImage[] = data.images.sort(() => 0.5 - Math.random()).slice(0, 5);
        randomImages.forEach((image: ILexicaImage) => {
          thumbnailsFromLexica.push(image.src);
        });
        setThumbnails(thumbnailsFromLexica);
      }
    } catch (error) {
      console.log("error", error);
    }
  };



  const cleanPageContent = (pageContent: string): string => {

    //remove html tags from the content
    pageContent = pageContent.replace(/<[^>]*>?/gm, '');

    //replace " with '
    pageContent = pageContent.replace(/"/g, "'");

    // remove all unicode characters
    pageContent = pageContent.replace(/[^\x00-\x7F]/g, "");

    return pageContent;
  };

  const getPageContentUsingGraphAPI = async (): Promise<string> => {

    // get the page content from the Microsoft Graph API
    const response = await callMicrosoftGraphAPI(
      "get",
      `/sites/${siteId}/pages/${pageId}`,
      "beta",
      null,
      ["id", "title"],
      ["webparts($filter=(isof('microsoft.graph.textWebPart')))"],
      null
    );
    return response?.webParts?.map((webPart: any) => webPart.innerHtml)?.join(' ') || '';
  };

  const getKeywordsFromPage = async (): Promise<string> => {

    // get the keywords from the page
    const page = await getItem(SITE_PAGES_LIBRARY_NAME, pageItemId, [KEYWORDS_COLUMN_NAME]);

    // if page is empty, return
    if (page === undefined) {
      return "";
    }

    let keywords: string = null;

    // if keywords is not empty, return the keywords by splitting it into sentences
    if (!isEmpty(page) && !isEmpty(page[KEYWORDS_COLUMN_NAME])) {
      keywords = page[KEYWORDS_COLUMN_NAME] || "";
    }

    // wait for 1 second before returning the keywords to show the loading spinner
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return keywords;
  };

  const getKeywordsFromAPI = async (): Promise<string> => {

    let pageContent = await getPageContentUsingGraphAPI();

    // if page content is empty, return
    if (isEmpty(pageContent)) {
      return "";
    }

    // clean the page content
    pageContent = cleanPageContent(pageContent);

    // get keywords from OpenAI
    const keywords = await getKeywordsUsingOpenAI(pageContent);

    // if keywords is empty, return
    if (isEmpty(keywords)) {
      return "";
    }

    // return the keywords by splitting it into sentences
    return keywords;
  };

  const executeKeywordsTasksAndUpdatePage = async (): Promise<void> => {
    let keywords: string = await getKeywordsFromPage();
    if (keywords === null) {
      keywords = await getKeywordsFromAPI();

      if (!isEmpty(keywords)) {
        // update the page with the keywords
        updatePagePnPPowerShell(siteUrl, pageItemId, KEYWORDS_COLUMN_NAME, keywords);
      }
    }
    await getThumbnailsFromLexicaUsingKeywords(keywords);
  };

  React.useEffect(() => {
    executeKeywordsTasksAndUpdatePage()
      .then(
        () => setLoading(false)
      )
      .catch(
        (error) => {
          console.log("error", error);
          setThumbnails([]);
          setLoading(false);
        }
      );
  }, []);

  return (

    <div className={thumbnailsStyles.mainContainer}>
      <div className={thumbnailsStyles.titleContainer}>
        <FontIcon className={thumbnailsStyles.icon} iconName="PhotoCollection" />
        <span className={thumbnailsStyles.title}>Possible thumbnails</span>
      </div>
      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading thumbnails..." styles={loadingSpinnerStyles} />
      ) : isEmpty(thumbnails) ? (
        <p className={thumbnailsStyles.description}>No thumbnails available</p>
      ) : (
        <div className={thumbnailsStyles.thumbnailsContainer}>
          <ul className={thumbnailsStyles.thumbnailsGallery}>
            {
              thumbnails.map((thumbnail, index) => (
                <li>
                  <img key={index} src={thumbnail} alt="thumbnail" className={thumbnailsStyles.thumbnail} />
                </li>
              ))

            }
          </ul>
        </div>
      )}
    </div>

  );
}

export default Thumbnails;