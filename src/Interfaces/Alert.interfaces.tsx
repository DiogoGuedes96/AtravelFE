export interface IAlert {
    text: string,
    type?: "success" | "info" | "warning" | "error",
    nextPage?: boolean,
    currentPath?: string,
    description?: string,
    action?: {
        text: string,
        toPage: string
    }
}