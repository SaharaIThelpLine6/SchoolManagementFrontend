import DefaultInput from "../../../components/Forms/DefaultInput";
import useTranslate from "../../../utils/Translate";

const FormColumn = ({ title, inputs }) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-center items-center my-4">
        <h2 className="text-base font-semibold text-gray-800">
          {translate(title)}
        </h2>
      </div>
      {inputs.map((input, index) => (
        <DefaultInput
          key={index}
          registerKey={input.registerKey}
          label={input.label ? `${translate(input.label)}` : ""}
          type={input.type}
          labelPosition="left"
        />
      ))}
    </div>
  );
};

export default FormColumn;
