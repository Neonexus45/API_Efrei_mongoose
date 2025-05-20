// src/utils/validator.mjs

class InternalFieldValidator {
    constructor(mainValidator, parentObject, path, value) {
        this.mainValidator = mainValidator;
        this.parentObject = parentObject;
        this.path = path;
        this.value = value;
        this.fieldName = path.length > 0 ? path.join('.') : 'request body';
    }

    _addError(message) {
        this.mainValidator._collectError({ field: this.fieldName, message });
    }

    required(message) {
        const msg = message || `${this.fieldName} is required.`;
        if (this.value === undefined || this.value === null || (typeof this.value === 'string' && this.value.trim() === '')) {
            this._addError(msg);
        }
        return this;
    }

    isString(message) {
        const msg = message || `${this.fieldName} must be a string.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value !== 'string') {
                this._addError(msg);
            }
        }
        return this;
    }

    isObject(schemaBuilderCallback, message) {
        const msg = message || `${this.fieldName} must be an object.`;
        
        if (this.value === undefined || this.value === null) {
            return this;
        }

        if (typeof this.value !== 'object' || Array.isArray(this.value)) {
            this._addError(msg);
            return this;
        }

        if (schemaBuilderCallback && typeof schemaBuilderCallback === 'function') {
            const subFieldSelector = (subFieldName) => {
                const subPath = [...this.path, subFieldName];
                const subValue = this.value && typeof this.value === 'object' ? this.value[subFieldName] : undefined;
                return new InternalFieldValidator(this.mainValidator, this.value, subPath, subValue);
            };
            schemaBuilderCallback(subFieldSelector);
        }
        return this;
    }

    isEmail(message) {
        const msg = message || `${this.fieldName} must be a valid email address.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                this._addError(msg);
            }
        }
        return this;
    }

    minLength(length, message) {
        const msg = message || `${this.fieldName} must be at least ${length} characters long.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value !== 'string' || this.value.length < length) {
                this._addError(msg);
            }
        }
        return this;
    }
    
    isNumber(message) {
        const msg = message || `${this.fieldName} must be a number.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value !== 'number') {
                this._addError(msg);
            }
        }
        return this;
    }

    isBoolean(message) {
        const msg = message || `${this.fieldName} must be a boolean.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value !== 'boolean') {
                this._addError(msg);
            }
        }
        return this;
    }

    isMongoId(message) {
        const msg = message || `${this.fieldName} must be a valid MongoDB ObjectId.`;
        if (this.value !== undefined && this.value !== null) {
            if (typeof this.value === 'string') {
                if (!/^[0-9a-fA-F]{24}$/.test(this.value)) {
                    this._addError(msg);
                }
            } else if (typeof this.value === 'object' && this.value.constructor && this.value.constructor.name === 'ObjectId') {
            } else if (typeof this.value === 'object' && typeof this.value.toHexString === 'function') {
                if (!/^[0-9a-fA-F]{24}$/.test(this.value.toHexString())) {
                     this._addError(msg);
                }
            }
            else {
                 this._addError(msg);
            }
        }
        return this;
    }
}

class Validator {
    constructor() {
        this.errors = [];
    }

    check(data) {
        this.errors = []; 
        return new InternalFieldValidator(this, null, [], data);
    }

    _collectError(error) {
        this.errors.push(error);
    }

    run() {
        return [...this.errors]; 
    }
}

export function validateRequest(data, schemaDefinitionCallback) {
    const validator = new Validator();
    const rootFieldValidator = validator.check(data); 
    
    if (schemaDefinitionCallback && typeof schemaDefinitionCallback === 'function') {
        schemaDefinitionCallback(rootFieldValidator);
    }
    
    return validator.run(); 
}