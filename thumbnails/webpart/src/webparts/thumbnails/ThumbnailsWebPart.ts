import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import Thumbnails from './components/Thumbnails';
import { IThumbnailsProps } from './components/IThumbnailsProps';

export interface IThumbnailsWebPartProps {
  description: string;
}

export default class ThumbnailsWebPart extends BaseClientSideWebPart<IThumbnailsWebPartProps> {

  public render(): void {
    const listItem: any = this.context.pageContext.listItem;
    const element: React.ReactElement<IThumbnailsProps> = React.createElement(
      Thumbnails,
      {
        spHttpClient: this.context.spHttpClient,
        aadHttpClientFactory: this.context.aadHttpClientFactory,
        msGraphClientFactory: this.context.msGraphClientFactory,
        pageItemId: listItem.id,
        pageId: listItem.uniqueId,
        siteId: this.context.pageContext.site.id.toString(),
        siteUrl: this.context.pageContext.site.absoluteUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: []
    };
  }
}
