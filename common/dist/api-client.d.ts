import { ApiResponse } from "./api";
export interface HttpResponse<Body = any> {
    statusCode: number;
    headers: Headers;
    body: Body;
}
export interface ApiClient {
    get: <Data = any>(endpoint: string) => Promise<HttpResponse<ApiResponse<Data>>>;
    post: <Data = any>(endpoint: string, body?: any) => Promise<HttpResponse<ApiResponse<Data>>>;
}
