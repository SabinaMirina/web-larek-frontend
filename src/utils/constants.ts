export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
    defaultHeaders: {
        'Content-Type': 'application/json'
    }
};

export const constraintForm = {
    formValue: {
        presence: {
            allowEmpty: false,
            message: '^Поле не может быть пустым'
        }
    }
};