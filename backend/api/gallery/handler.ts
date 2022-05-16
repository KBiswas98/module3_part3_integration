import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayProxyHandlerV2, S3Handler } from 'aws-lambda';
import { RequestGalleryQueryParams } from './gallery.interfaces';
import { GalleryManager } from './gallery.manager';

const galleryManager = new GalleryManager();

export const getPictures: APIGatewayProxyHandlerV2 = async (event) => {
  log('getPictures method from gallery handler, event:', event);

  try {
    const query: RequestGalleryQueryParams = {
      page: event.queryStringParameters?.page,
      limit: event.queryStringParameters?.limit,
      filter: event.queryStringParameters?.filter,
    };
    // @ts-ignore
    const email = event.requestContext.authorizer.lambda.email;

    const pictures = await galleryManager.getPictures(query, email);

    return createResponse(200, pictures);
  } catch (error) {
    return errorHandler(error);
  }
};

export const uploadPicture: APIGatewayProxyHandlerV2 = async (event) => {
  log('uploadPicture method from gallery handler, event:', event);
  try {
    // @ts-ignore
    const response = await galleryManager.uploadPicture(event.body);

    return createResponse(200, response);
  } catch (error) {
    return errorHandler(error);
  }
};

export const getPreSignedUploadLink: APIGatewayProxyHandlerV2 = async (event) => {
  log('getPreSignedUploadLink method from gallery handler, event:', event);

  try {
    // @ts-ignore
    const email = event.requestContext.authorizer.lambda.email;

    const response = await galleryManager.getPreSignedUploadLink(email, event.body);

    return createResponse(200, response);
  } catch (error) {
    return errorHandler(error);
  }
};

export const s3Upload: S3Handler = async (event) => {
  log('s3Upload method from gallery handler, event:', event);

  const imageName = event.Records[0].s3.object.key;

  await galleryManager.updatePicture(imageName);
};
