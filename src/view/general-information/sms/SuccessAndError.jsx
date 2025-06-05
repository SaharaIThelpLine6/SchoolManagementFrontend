import React from "react";
import { useSelector } from "react-redux";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";

const SuccessAndError = () => {
  const translate = useTranslate();
  const messagesData = useSelector(
    (state) => state.smsSuccessError.successAndErrorMessages
  );

  const columns = [
    {
      title: translate("Status"),
      field: "status",
      hozAlign: "center",
      render: (row) => {
        const status = row.data?.status;
        const colorClass =
          status === "success"
            ? "text-green-600 font-semibold"
            : "text-red-600 font-semibold";

        return <p className={`text-center ${colorClass}`}>{status || "—"}</p>;
      },
    },
    {
      title: translate("SMS ID"),
      field: "smsid",
      hozAlign: "center",
      render: (row) => <p className="text-center">{row.data?.smsid || "—"}</p>,
    },
    {
      title: translate("Phone Number"),
      field: "phone_number",
      hozAlign: "center",
    },
    {
      title: translate("Message"),
      field: "message",
      hozAlign: "center",
      render: (row) => (
        <p className="text-center">{row.data?.message || "—"}</p>
      ),
    },
  ];

  return (
    <div className="font-SolaimanLipi">
      <div className="max-h-[600px] overflow-y-auto">
        <SortableTable
          columns={columns}
          data={messagesData}
          isFilterColumn={false}
        />
      </div>
    </div>
  );
};

export default SuccessAndError;
