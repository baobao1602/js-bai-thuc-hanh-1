// Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};


        //  hàm thực hiện validate
        function validate(inputElement, rule) {
            
            var  errorElemetn = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
            var errorMessage;

            // lấy ra các rules của selecyor
            var rules = selectorRules[rule.selector];

            // lặp qua từng rules & kiểm tra
            // nếu có lỗi thì dừng việc kiểm tra
            for (var i = 0; i < rules .length; i++) {
                switch (inputElement.type) {
                    case 'radio':
                    case 'checkbox':
                        errorMessage = rules[i] (
                            formElement.querySelector(rule.selector + 'checked')
                        );
                        break;
                    default:
                        errorMessage = rules[i](inputElement.value);

                }
                
                if(errorMessage) break;
            }
                if (errorMessage) {
                    errorElemetn.innerText = errorMessage;
                    getParent(inputElement, options.formGroupSelector).classList.add('invalid');
                } else {
                    errorElemetn.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }

                return !errorMessage;
        }

    
    // lẩy Element của form cần validate
    var formElement = document.querySelector(options.form);
    if(formElement) { 

        // khi sumbmit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // thực hiện lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });
            //var enableInputs = formElement.querySelector('[name]:not(diabled):not([type="hidden"])');
            

            
                if (isFormValid) {
                    // trường hợp suBmit với javascipt
                    if (typeof options.onSubmit === 'function') {
                        var enableInputs = formElement.querySelectorAll('[name]');
                        var formValues = Array.from(enableInputs).reduce(function (values, input) {
                            
                            switch (input.type) {
                                case 'radio':
                                case 'checkbox':
                                    values[input.name] = formElement.querySelector('input.[name"' + input.name + '"]:checked').value;
                                    break;
                                default:
                                    values[input.name] = input.value;
                            }
                            return values;
                        }, {});

                        options.onSubmit(formValues);
                    }
                    // trường hợp submit với hành vi mặc định
                    else {
                        formElement.submit();
                    }   
                
                }
        }
    }

        // xử lý lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
       
        options.rules.forEach(function (rule) {

            // lưu lại các rules cho mỗi input

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function(inputElement){
                 // xử lý trường hợp blur ra khỏi input
                 inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                 // sử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var  errorElemetn = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    errorElemetn.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });

          

           
        });

        console.log(selectorRules);
    

}

// định nghĩa các rules
// 1. khi có lỗi => trả ra, messae lỗi
// 2. khi hợp lệ => không trả ra cái gì cả (undefined)

Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined: 'Vui lòng nhập trường này !'
        }
    };
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập Email'
        }
    }
}


Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}