export const updateAction = async (prevState: { title: string; message: string; }, _formData: FormData) => {
    console.log('updateAction called with formData:', _formData);
    // Handle form submission
    // return Promise.resolve();
    const title = "Here is the form data just submitted, together with some useRef values:";
    let message = title + "\n";
    for (const [key, value] of _formData.entries()) {
        let valueString = '';
        if (value instanceof File) {
            valueString = `File(name=${value.name}, size=${value.size} bytes, type=${value.type})`;
        } else {
            valueString = value.toString();
        }
        message += `<p>${key}: ${valueString}</p>\n`;
    }
    if (prevState) {
        message += `<p>Previous title: ${prevState.title}</p>\n`;
        message += `<p>Previous message: ${prevState.message}</p>\n`;
    }

    return { title, message };
};
