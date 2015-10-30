declare module "colors/safe" {
    interface Colors {
        red(text: string): string;
    }
    
    var colors: Colors;
    export default colors;
}
