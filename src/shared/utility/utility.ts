import { BlobServiceClient } from "@azure/storage-blob";
import { HttpException, HttpStatus } from "@nestjs/common";
import axios from "axios";
import * as bcrypt from "bcrypt";
import phone from "phone";
import { ParamsDto } from "src/modules/cms/cms.dto";
import { v4 as uuidv4 } from "uuid";
import { HASH_SALT } from "../constant";
const moment = require("moment");

export const generateHash = async (input: string): Promise<string> => {
  return await bcrypt.hash(input, HASH_SALT);
};

export const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
};

const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.error?.message ||
    error?.response?.statusText ||
    "Unknown error"
  );
};

const getErrorStatus = (error: any): number => {
  return error?.response?.status || error?.status || 500;
};

export const formatCrmError = (
  error: any
): { message: string; status: number } => {
  return {
    message: getErrorMessage(error),
    status: getErrorStatus(error)
  };
};

export const getDayBoundaries = (
  date: Date | string
): { startOfDay: string; endOfDay: string } => {
  try {
    const startOfDay = new Date(
      new Date(date).setUTCHours(0, 0, 0, 0)
    ).toISOString();
    const endOfDay = new Date(
      new Date(date).setUTCHours(23, 59, 59, 999)
    ).toISOString();
    return { startOfDay, endOfDay };
  } catch (error) {
    throw error;
  }
};

export const getEnvironmentNameFromEmail = (email: string): string => {
  try {
    const env = email.split("@")[1].split(".")[0];
    if (!env) {
      throw new HttpException("Environment not found.", HttpStatus.BAD_REQUEST);
    }
    return env;
  } catch (error) {
    throw error;
  }
};

export const mergeParams = (
  initial: ParamsDto,
  params: ParamsDto
): ParamsDto => {
  const mergedParams: ParamsDto = { ...initial };

  if (params?.$filter) {
    mergedParams.$filter = initial.$filter
      ? `${initial.$filter},${params.$filter}`
      : params.$filter;
  }

  if (params?.$select) {
    mergedParams.$select = initial.$select
      ? `${initial.$select},${params.$select}`
      : params.$select;
  }

  if (params?.$expand) {
    mergedParams.$expand = params.$expand ?? initial?.$expand;
  }

  if (typeof params?.$count !== "undefined") {
    mergedParams.$count = params?.$count;
  }

  if (params?.$top) {
    mergedParams.$top = params?.$top;
  }

  return mergedParams;
};

const parseExpands = (expand: string): { [key: string]: string[] } => {
  const expandObj: { [key: string]: string[] } = {};
  const expands = expand.split(",");

  expands.forEach((e) => {
    const [entity, details] = e.split("($select=");
    if (details) {
      const [fields, nested] = details.split(";$expand=");
      expandObj[entity] = fields.replace(")", "").split(",");

      if (nested) {
        expandObj[entity + ".$expand"] = nested
          .replace(")", "")
          .split(";")
          .map((x) => x.split("=")[1]);
      }
    }
  });

  return expandObj;
};

const mergeExpands = (
  initial: { [key: string]: string[] },
  params: { [key: string]: string[] }
): { [key: string]: string[] } => {
  const merged: { [key: string]: string[] } = { ...initial };

  for (const key in params) {
    if (merged[key]) {
      merged[key] = Array.from(new Set([...merged[key], ...params[key]]));
    } else {
      merged[key] = params[key];
    }
  }

  return merged;
};

const formatExpands = (expands: { [key: string]: string[] }): string => {
  let formatted = "";

  for (const entity in expands) {
    if (entity.includes(".$expand")) {
      const mainEntity = entity.split(".$expand")[0];
      formatted = formatted.replace(
        mainEntity + ")",
        mainEntity + `;$expand=${expands[entity].join(",")})`
      );
    } else {
      formatted += `${entity}($select=${expands[entity].join(",")}),`;
    }
  }

  return formatted.slice(0, -1);
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  return phone(`+${phoneNumber.replace(/\s+/g, "")}`).isValid;
};

export const uploadFileToAzure = async (
  file: any,
  containerName: string
): Promise<any> => {
  try {
    const blobServiceClient = new BlobServiceClient(
      process.env.AZURE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${uuidv4()}.${file.originalname.split(".").pop()}`;
    const blockBlobClient: any = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer);
    return {
      image: blockBlobClient.url,
      imageId: blockBlobClient?._name.split("/")?.[1]
    };
  } catch (error) {
    throw error;
  }
};

export const deleteFileFromAzure = async (
  fileName: string,
  containerName: string
): Promise<any> => {
  try {
    const blobServiceClient = new BlobServiceClient(
      process.env.AZURE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    return await blobClient.deleteIfExists();
  } catch (error) {
    throw error;
  }
};

export const sendOtpToPhoneNumber = async (
  phoneNumber: string,
  body: string
) => {
  try {
    return await axios.post(
      `http://api.smscountry.com/SMSCwebservice_bulk.aspx?User=DEYAAR_DFM&passwd=deyaardfm001&mobilenumber=${phoneNumber}&message=${body}&sid=Dyr&mtype=LNG&DR=Y`
    );
  } catch (error) {
    throw error;
  }
};
