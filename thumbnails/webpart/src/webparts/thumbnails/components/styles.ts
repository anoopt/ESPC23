import { getTheme, FontWeights, AnimationStyles, FontSizes } from '@fluentui/react/lib/Styling';
import { mergeStyleSets } from '@fluentui/merge-styles';
import { NeutralColors, MotionDurations, Depths } from '@fluentui/theme';
import { ISpinnerStyles } from '@fluentui/react/lib/Spinner';

const theme = getTheme();
const ThemeState = (<any>window).__themeState__;
function getThemeColor(slot: string) {
    if (ThemeState && ThemeState.theme && ThemeState.theme[slot]) {
        return ThemeState.theme[slot];
    }
    return theme[slot as keyof typeof theme];
}

export const loadingSpinnerStyles: Partial<ISpinnerStyles> = {
    root: {
        ...AnimationStyles.fadeIn200,
        animationDuration: MotionDurations.duration4
    },
    label: {
        fontSize: "14px", 
        fontWeight: 400,
        color: getThemeColor('themePrimary')
    }
}

export interface IThumbnailsStyles {
    mainContainer: string;
    titleContainer: string;
    icon: string;
    title: string;
    description: string;
    descriptionContainer: string;
    thumbnailsContainer: string;
    thumbnailsGallery: string;
    thumbnail: string;
}

export const thumbnailsStyles: IThumbnailsStyles = mergeStyleSets({
    mainContainer: {
        ...AnimationStyles.slideRightIn400,
        animationDuration: MotionDurations.duration4,
        backgroundColor: getThemeColor('themeLighter'),
        borderLeft: '5px solid ' + getThemeColor('themeDarker'),
        color: NeutralColors.black,
        padding: '10px',
        borderRadius: '5px',
        boxShadow: Depths.depth16,
        minHeight: '100px'
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        ...AnimationStyles.slideRightIn400,
        fontSize: FontSizes.xLarge,
        fontWeight: FontWeights.regular,
        marginRight: '10px'
    },
    title: {
        ...AnimationStyles.slideRightIn400,
        fontSize: FontSizes.xLarge,
        fontWeight: FontWeights.semibold,
        marginBottom: '6px'
    },
    descriptionContainer: {
        display: 'flex'
    },
    description: {
        ...AnimationStyles.fadeIn500,
        fontSize: FontSizes.mediumPlus,
        fontWeight: FontWeights.regular,
        marginBottom: '10px'
    },
    thumbnailsContainer: {
        ...AnimationStyles.fadeIn500
    },
    thumbnailsGallery: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: '10px',
        listStyle: 'none',
        paddingLeft: '0px'
    },
    thumbnail: {
        ...AnimationStyles.fadeIn500,
        width: '200px',
        height: '200px',
        boxShadow: Depths.depth8,
        borderRadius: '5px'
    }
});
