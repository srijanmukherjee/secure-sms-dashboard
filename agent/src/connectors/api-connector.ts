import {ApiClient, ApiResponse, HttpResponse} from 'common';

export class ApiClientImpl implements ApiClient {
  constructor(private baseUrl: string) {}

  get<Data>(endpoint: string): Promise<HttpResponse<ApiResponse<Data>>> {
    return fetch(`${this.baseUrl}/${endpoint}`).then(async response => {
      const content = await response.text();
      const responseBody = content ? JSON.parse(content) : {};
      return {
        statusCode: response.status,
        headers: response.headers,
        body: responseBody as ApiResponse<Data>,
      };
    });
  }

  post<Data = any>(endpoint: string, body?: any): Promise<HttpResponse<ApiResponse<Data>>> {
    return fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async response => {
      const content = await response.text();
      const responseBody = content ? JSON.parse(content) : {};
      return {
        statusCode: response.status,
        headers: response.headers,
        body: responseBody as ApiResponse<Data>,
      };
    });
  }
}
