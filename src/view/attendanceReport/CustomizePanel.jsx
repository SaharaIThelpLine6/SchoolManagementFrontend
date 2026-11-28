// হাজিরা রিপোর্ট — নিজের মতো রিপোর্ট সাজানো: শিরোনাম, কলাম (চালু/বন্ধ, আগে-পরে), সাজানো ও ভাগ,
// কাগজ ও লেখা, কী কী দেখাবে, এবং টেমপ্লেট হিসেবে সংরক্ষণ।
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { PAPERS } from './paper';
import StatusIcon from './StatusIcon';
import { SORT_OPTIONS, STATUS_KEYS, STATUS_META, groupOptionsFor, typeOf } from './reportEngine';

const INPUT =
  'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

const PAPER_OPTIONS = Object.entries(PAPERS).map(([value, p]) => ({ value, label: p.label }));
const FONT_OPTIONS = ['9', '10', '11', '12', '13', '14'].map((v) => ({ value: v, label: `${v} px` }));

// DefaultSelect (react-hook-form) কে সাধারণ value/onChange হিসেবে ব্যবহার
function SettingSelect({ name, label, value, options, onChange }) {
  const methods = useForm({ defaultValues: { [name]: String(value) } });
  const { setValue } = methods;
  useEffect(() => {
    setValue(name, String(value));
  }, [name, value, setValue]);
  return (
    <FormProvider {...methods}>
      <DefaultSelect
        label={label}
        registerKey={name}
        options={options}
        valueField="value"
        nameField="label"
        hidePlaceholder
        onChange={(o) => o && onChange(o.value)}
      />
    </FormProvider>
  );
}
SettingSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
  onChange: PropTypes.func.isRequired,
};

function Section({ title, icon, children }) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-bold text-slate-800">
        <SvgIcon name={icon} size={16} className="text-blue-600" />
        {title}
      </div>
      {children}
    </div>
  );
}
Section.propTypes = { title: PropTypes.string.isRequired, icon: PropTypes.string.isRequired, children: PropTypes.node };

function Toggle({ label, checked, onChange, icon }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {icon}
      {label}
    </label>
  );
}
Toggle.propTypes = { label: PropTypes.string.isRequired, checked: PropTypes.bool, onChange: PropTypes.func.isRequired, icon: PropTypes.node };

function Segmented({ value, options, onChange }) {
  return (
    <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2 py-[7px] text-sm transition ${
            value === o.value ? 'bg-white font-bold text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
Segmented.propTypes = { value: PropTypes.string, options: PropTypes.array.isRequired, onChange: PropTypes.func.isRequired };

const CustomizePanel = ({ settings, update, base, columns, setColumns, templates, onSaveTemplate, onLoadTemplate, onDeleteTemplate }) => {
  const [templateName, setTemplateName] = useState('');
  const type = typeOf(settings.reportType);

  const move = (index, step) => {
    const next = [...columns];
    const target = index + step;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setColumns(next);
  };
  const toggleColumn = (key, on) => setColumns(columns.map((c) => (c.key === key ? { ...c, on } : c)));
  const toggleStatus = (key, on) => {
    const set = new Set(settings.statuses);
    if (on) set.add(key);
    else set.delete(key);
    update({ statuses: STATUS_KEYS.filter((k) => set.has(k)) });
  };

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <SvgIcon name="IoMdSettings" size={18} className="text-blue-600" />
        <h4 className="text-[17px] font-bold text-slate-800">রিপোর্ট সাজান</h4>
      </header>

      <Section title="শিরোনাম" icon="FiEdit">
        <div className="space-y-2">
          <input
            className={INPUT}
            value={settings.title}
            placeholder={type.title}
            onChange={(e) => update({ title: e.target.value })}
          />
          <input
            className={INPUT}
            value={settings.subtitle}
            placeholder="উপ-শিরোনাম (খালি থাকলে তারিখ ও ফিল্টার)"
            onChange={(e) => update({ subtitle: e.target.value })}
          />
        </div>
      </Section>

      {(base === 'daily' || base === 'individual') && (
        <Section title="কাদের দেখাবে" icon="TbFilterPlus">
          <div className="grid grid-cols-2 gap-2">
            {STATUS_KEYS.map((k) => (
              <Toggle
                key={k}
                label={STATUS_META[k].label}
                icon={<StatusIcon status={k} size={15} />}
                checked={settings.statuses.includes(k)}
                onChange={(on) => toggleStatus(k, on)}
              />
            ))}
          </div>
        </Section>
      )}
      {base === 'punch' && (
        <Section title="কোন পাঞ্চ দেখাবে" icon="TbFilterPlus">
          <Segmented
            value={settings.punchFilter}
            onChange={(v) => update({ punchFilter: v })}
            options={[
              { value: 'all', label: 'সব' },
              { value: 'late', label: 'শুধু দেরি' },
              { value: 'ontime', label: 'সময়মতো' },
            ]}
          />
        </Section>
      )}

      <Section title="কলাম" icon="TableShortcut">
        <p className="mb-2 text-xs text-slate-500">টিক দিয়ে কলাম চালু/বন্ধ করুন, তীর দিয়ে আগে-পরে নিন।</p>
        <ul className="max-h-[340px] space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
          {columns.map((c, i) => (
            <li
              key={c.key}
              className={`flex items-center gap-2 rounded-lg border px-2 py-[5px] ${c.on ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200 bg-white'}`}
            >
              <input type="checkbox" className="h-4 w-4 shrink-0 accent-blue-600" checked={c.on} onChange={(e) => toggleColumn(c.key, e.target.checked)} />
              <span className={`min-w-0 flex-1 truncate text-sm ${c.on ? 'text-slate-800' : 'text-slate-500'}`}>{c.label}</span>
              <button
                type="button"
                aria-label="উপরে"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="rounded p-1 text-slate-500 hover:bg-white hover:text-blue-700 disabled:opacity-30"
              >
                <SvgIcon name="FaChevronUp" size={12} />
              </button>
              <button
                type="button"
                aria-label="নিচে"
                disabled={i === columns.length - 1}
                onClick={() => move(i, 1)}
                className="rounded p-1 text-slate-500 hover:bg-white hover:text-blue-700 disabled:opacity-30"
              >
                <SvgIcon name="FaChevronDown" size={12} />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setColumns([])} className="mt-2 text-xs font-semibold text-blue-700 hover:underline">
          ডিফল্ট কলামে ফিরুন
        </button>
      </Section>

      <Section title="সাজানো ও ভাগ" icon="TbChecklist">
        <div className="space-y-3">
          <SettingSelect name="rptSortBy" label="কিসের ক্রমে" value={settings.sortBy} options={SORT_OPTIONS} onChange={(v) => update({ sortBy: v })} />
          {base !== 'individual' && (
            <>
              <SettingSelect
                name="rptGroupBy"
                label="ভাগ করে দেখান"
                value={settings.groupBy}
                options={groupOptionsFor(base)}
                onChange={(v) => update({ groupBy: v })}
              />
              <Toggle label="প্রতি ভাগে ক্রমিক নতুন করে" checked={settings.slPerGroup} onChange={(v) => update({ slPerGroup: v })} />
            </>
          )}
        </div>
      </Section>

      <Section title="কাগজ ও লেখা" icon="TbFileText">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SettingSelect name="rptPaper" label="কাগজ" value={settings.paper} options={PAPER_OPTIONS} onChange={(v) => update({ paper: v })} />
            <SettingSelect name="rptFont" label="লেখার আকার" value={settings.fontSize} options={FONT_OPTIONS} onChange={(v) => update({ fontSize: v })} />
          </div>
          <Segmented
            value={settings.orientation}
            onChange={(v) => update({ orientation: v })}
            options={[
              { value: 'portrait', label: 'লম্বালম্বি' },
              { value: 'landscape', label: 'আড়াআড়ি' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Segmented
              value={settings.digits}
              onChange={(v) => update({ digits: v })}
              options={[
                { value: 'bn', label: '১২৩' },
                { value: 'en', label: '123' },
              ]}
            />
            <Segmented
              value={settings.timeFormat}
              onChange={(v) => update({ timeFormat: v })}
              options={[
                { value: '12', label: '১২ ঘণ্টা' },
                { value: '24', label: '২৪ ঘণ্টা' },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="যা যা দেখাবে" icon="FaEye">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Toggle label="প্রতিষ্ঠানের নাম ও ঠিকানা" checked={settings.showHeader} onChange={(v) => update({ showHeader: v })} />
          <Toggle label="লোগো" checked={settings.showLogo} onChange={(v) => update({ showLogo: v })} />
          <Toggle label="সারসংক্ষেপ" checked={settings.showStats} onChange={(v) => update({ showStats: v })} />
          <Toggle label="অবস্থা রঙিন" checked={settings.colorStatus} onChange={(v) => update({ colorStatus: v })} />
          <Toggle label="তৈরির সময়" checked={settings.showGeneratedAt} onChange={(v) => update({ showGeneratedAt: v })} />
          <Toggle label="স্বাক্ষরের ঘর" checked={settings.showSignature} onChange={(v) => update({ showSignature: v })} />
        </div>
        {settings.showSignature && (
          <input
            className={`${INPUT} mt-3`}
            value={settings.signatures}
            placeholder="স্বাক্ষর (কমা দিয়ে আলাদা করুন)"
            onChange={(e) => update({ signatures: e.target.value })}
          />
        )}
      </Section>

      <Section title="আমার টেমপ্লেট" icon="Copy">
        <p className="mb-2 text-xs text-slate-500">
          এই সাজানো রিপোর্টটি নাম দিয়ে রাখুন, পরে এক ক্লিকে আবার পাবেন (এই ব্রাউজারে সংরক্ষিত থাকে)।
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (onSaveTemplate(templateName)) setTemplateName('');
          }}
        >
          <input className={INPUT} value={templateName} placeholder="টেমপ্লেটের নাম" onChange={(e) => setTemplateName(e.target.value)} />
          <button
            type="submit"
            disabled={!templateName.trim()}
            className="shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            রাখুন
          </button>
        </form>
        {templates.length > 0 && (
          <ul className="mt-3 space-y-1">
            {templates.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-[6px]">
                <button type="button" onClick={() => onLoadTemplate(t)} className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="truncate text-xs text-slate-500">{typeOf(t.settings.reportType).name}</div>
                </button>
                <button
                  type="button"
                  aria-label="মুছুন"
                  onClick={() => onDeleteTemplate(t)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <SvgIcon name="FaTrash" size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </aside>
  );
};

CustomizePanel.propTypes = {
  settings: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  base: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, on: PropTypes.bool })).isRequired,
  setColumns: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  onSaveTemplate: PropTypes.func.isRequired,
  onLoadTemplate: PropTypes.func.isRequired,
  onDeleteTemplate: PropTypes.func.isRequired,
};

export default CustomizePanel;
