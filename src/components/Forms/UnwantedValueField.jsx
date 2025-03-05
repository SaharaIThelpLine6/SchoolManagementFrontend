import React from 'react';

const UnwantedValueField = ({value}) => {
    return (
        <input
            type="text"
            value={value}
            disabled
        />
    );
};

export default UnwantedValueField;