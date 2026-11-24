import React, { useEffect } from 'react';
import { LABELS } from '../../helper/labels';
import { formatDate, formatMoney, getMonthNameBn } from '../../utils/format';
import { Modal } from './Modal';

export const ReceiptView = ({ payment, teacher, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && payment) {
      document.body.classList.add('receipt-modal-open');
      return () => {
        document.body.classList.remove('receipt-modal-open');
      };
    }
  }, [isOpen, payment]);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={LABELS.receipt.title}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {LABELS.common.close}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 9V3h12v6" />
              <rect width="12" height="8" x="6" y="14" rx="1" />
            </svg>
            <span>{LABELS.common.print}</span>
          </button>
        </>
      }
    >
      <div className="print-container bg-white border border-slate-200 rounded-xl p-6 sm:p-8 text-slate-900">
        {/* School Header */}
        <div className="text-center border-b border-slate-200 pb-4">
          <h3 className="text-xl font-bold text-slate-900">{LABELS.app.schoolName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{LABELS.app.schoolAddress}</p>
          <p className="inline-block mt-3 px-4 py-1 text-sm font-semibold bg-slate-100 text-slate-800 rounded-md">
            {LABELS.receipt.title}
          </p>
        </div>

        {payment.isReversed && (
          <div className="mt-4 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <p className="font-semibold">{LABELS.receipt.reversedWatermark}</p>
            {payment.reverseReason && (
              <p className="text-xs mt-0.5">
                {LABELS.receipt.reverseReason}: {payment.reverseReason}
              </p>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-sm">
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <span className="text-slate-500 w-28 shrink-0">{LABELS.receipt.receiptNo}:</span>
              <span className="font-mono-num font-semibold text-slate-900">
                {payment.receiptNo}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-28 shrink-0">{LABELS.receipt.teacherName}:</span>
              <span className="font-semibold text-slate-900">
                {teacher?.name ?? payment.userId}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-28 shrink-0">{LABELS.receipt.designation}:</span>
              <span className="text-slate-800">{teacher?.designation ?? '—'}</span>
            </div>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <div className="flex sm:justify-end gap-2">
              <span className="text-slate-500">{LABELS.receipt.date}:</span>
              <span className="font-mono-num font-medium text-slate-900">
                {formatDate(payment.paymentDate)}
              </span>
            </div>
            <div className="flex sm:justify-end gap-2">
              <span className="text-slate-500">{LABELS.receipt.teacherCode}:</span>
              <span className="font-mono-num text-slate-800">{teacher?.userCode ?? '—'}</span>
            </div>
            <div className="flex sm:justify-end gap-2">
              <span className="text-slate-500">{LABELS.receipt.method}:</span>
              <span className="font-medium text-slate-900">
                {LABELS.paymentMethods[payment.method]}
              </span>
            </div>
          </div>
        </div>

        {/* Month Breakdown Table */}
        <div className="mt-5 border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-left font-semibold px-4 py-2.5">{LABELS.receipt.colMonth}</th>
                <th className="text-right font-semibold px-4 py-2.5">{LABELS.receipt.colAmount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payment.details.map((d, idx) => (
                <tr key={`${d.year}-${d.month}-${idx}`}>
                  <td className="px-4 py-2.5 text-slate-800">
                    {getMonthNameBn(d.month)} {d.year}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono-num font-medium text-slate-900">
                    {formatMoney(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-4 py-2.5">{LABELS.receipt.totalAmount}</td>
                <td className="px-4 py-2.5 text-right font-mono-num">
                  {formatMoney(payment.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Amount in Words & Note */}
        <div className="mt-4 space-y-1.5 text-sm">
          <p>
            <span className="text-slate-500">{LABELS.receipt.inWords}: </span>
            <span className="font-semibold text-slate-900">{payment.inWord}</span>
          </p>
          {payment.note && (
            <p>
              <span className="text-slate-500">{LABELS.receipt.note}: </span>
              <span className="text-slate-700">{payment.note}</span>
            </p>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-14 pt-2 text-center text-xs text-slate-600">
          <div>
            <div className="border-t border-slate-400 pt-2 mx-4">
              {LABELS.receipt.receiverSign}
            </div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2 mx-4">
              {LABELS.receipt.accountantSign}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};