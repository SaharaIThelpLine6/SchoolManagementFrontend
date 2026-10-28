export const matchesExamConditionDestination = (response, SessionID, ExamID) =>
  response?.target?.SessionID != null &&
  response?.target?.ExamID != null &&
  Number(response.target.SessionID) === Number(SessionID) &&
  Number(response.target.ExamID) === Number(ExamID) &&
  Array.isArray(response.results) &&
  response.results.every((item) =>
    Number(item.SessionID) === Number(SessionID) && Number(item.ExamID) === Number(ExamID));

export const formatExamConditionPasteResult = (response, copiedConditions) => {
  const sourceKey = (row) => `${row.SessionID}:${row.ExamID}:${row.SubClassID}`;
  const sources = new Map(copiedConditions.map((row) => [sourceKey(row), row]));
  const target = response.target ?? {};

  return {
    ...response,
    sessionName: target.SessionName ?? target.SessionID ?? response.results[0]?.SessionID,
    examName: target.ExamName ?? target.ExamID ?? response.results[0]?.ExamID,
    results: response.results.map((item) => {
      const source = sources.get(sourceKey(item.source)) ?? item.source;
      return {
        ...item,
        label: [
          target.SessionName ?? item.SessionID ?? target.SessionID,
          target.ExamName ?? item.ExamID ?? target.ExamID,
          source.SubClass?.SubClass ?? item.SubClassID ?? source.SubClassID,
        ].join(' / '),
      };
    }),
  };
};
