export interface ILexicaImage {
    id: string;
    gallery: string;
    src: string;
    srcSmall: string;
    prompt: string;
    width: number;
    height: number;
    seed: string;
    grid: boolean;
    model: string;
    guidance: number;
    promptid: string;
    nsfw: boolean;
}

export interface ILexicaImages {
    images: ILexicaImage[];
}