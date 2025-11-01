// src/utils/locationUtils.js
export const extractLocationCodes = (policeStationID) => {
  if (!policeStationID)
    return { DivisionID: '', DistrictID: '', PoliceStationID: '' };

  const idStr = policeStationID.toString();

  return {
    DivisionID: Number(idStr.slice(0, 1)), // প্রথম সংখ্যা
    DistrictID: Number(idStr.slice(0, 3)), // প্রথম ৩ সংখ্যা
    PoliceStationID: Number(idStr), // পুরো সংখ্যা
  };
};
