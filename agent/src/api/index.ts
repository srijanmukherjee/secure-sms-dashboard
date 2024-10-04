import {AppConfig} from 'src/config/app-config';
import {ApiClientImpl} from 'src/connectors/api-connector';

export const client = new ApiClientImpl(AppConfig.API_BASE_URL);
