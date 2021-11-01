import React from 'react';

const useInput = (initialValue: string) => {
    const [value, setValue] = React.useState(initialValue);

    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
        setValue(event.currentTarget.value);
    };

    return {
        value,
        onChange: handleChange
    };
};

export default useInput;