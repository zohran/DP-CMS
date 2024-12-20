import moment from "moment";
import { getDayBoundaries } from "./utility/utility";
import { TaskFilterDto } from "src/modules/cms/modules/booking/booking.dto";

export const HASH_SALT = 10;
export const CRM_VERSION = "v9.1";
export const COMMON_URL = `api/data/${CRM_VERSION}`;
const END_POINTS = {
  BOOKABALE_RESOURCE_BOOKINGS: {
    endpoint: `${COMMON_URL}/bookableresourcebookings`,
    params: {
      $expand:
        "msdyn_workorder($expand=msdyn_workordertype($select=msdyn_name),msdyn_priority($select=msdyn_name),msdyn_FunctionalLocation($select=msdyn_name),msdyn_serviceaccount),BookingStatus($select=name),plus_case($expand=primarycontactid($select=fullname),msdyn_FunctionalLocation($select=msdyn_name))"
    }
  }
};

export const DATES = {
  today: () => getDayBoundaries(new Date().toISOString()),
  tomorrow: () => {
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    return getDayBoundaries(tomorrow);
  },
  week: () => {
    const { startOfDay } = getDayBoundaries(new Date().toISOString());
    const nextWeekDate = moment().endOf("week").toDate();
    const { endOfDay } = getDayBoundaries(nextWeekDate);

    return { startOfDay, endOfDay };
  }
};

const buildQueryParams = (
  query: any | null,
  resourceId: string,
  date?: Date | string | null
) => {
  const params = {
    ...END_POINTS?.BOOKABALE_RESOURCE_BOOKINGS?.params,
    $filter: `_resource_value eq ${resourceId}`,
    $count: "true"
  };

  if (query?.workordertype) {
    params["$filter"] +=
      ` and msdyn_workorder/_msdyn_workordertype_value eq ${query?.workordertype}`;
  }

  if (date) {
    const { startOfDay, endOfDay } = getDayBoundaries(
      new Date(date).toISOString()
    );
    params["$filter"] +=
      ` and starttime ge ${startOfDay} and starttime lt ${endOfDay}`;
  }

  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

export const URLS_AND_QUERY_PARAMS = {
  BOOKING: {
    GET: {
      BOOKINGS: {
        endpoint: (base_url: string): string =>
          `${base_url}${END_POINTS.BOOKABALE_RESOURCE_BOOKINGS.endpoint}?`,
        query: (query: TaskFilterDto | null, resourceId: string) =>
          buildQueryParams(query, resourceId)
      },
      BOOKING_DETAIL: {
        endpoint: (base_url: string, bookingId: string): string =>
          `${base_url}${END_POINTS.BOOKABALE_RESOURCE_BOOKINGS.endpoint}${`(${bookingId})`}?`,
        query: () =>
          `$expand=${END_POINTS.BOOKABALE_RESOURCE_BOOKINGS.params.$expand}`
      },
      BOOKINGS_FOR_CALENDER: {
        endpoint: (base_url: string): string =>
          `${base_url}${END_POINTS.BOOKABALE_RESOURCE_BOOKINGS.endpoint}?`,
        query: (date: Date | string | null, resourceId: string) =>
          buildQueryParams(null, resourceId, date)
      }
    }
  }
};
