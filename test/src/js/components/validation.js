import { Validation, ValidationConfig } from 'bunnyjs/src/Validation';

const initValidation = form => {
    ValidationConfig.classLabel = 'label';
    Validation.init(form, true);
};

const readyForm = form => {
    Array.from(form.querySelectorAll('.form-group .wpcf7-form-control-wrap .wpcf7-form-control[name]')).forEach(input =>
        input.hasAttribute('aria-required') && input.setAttribute('required', '')
    );
    initValidation(form);
};

export default () => Array.from(document.querySelectorAll('.wpcf7-form')).forEach(form => readyForm(form));
