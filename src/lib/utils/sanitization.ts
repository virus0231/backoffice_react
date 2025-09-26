/**
 * Input sanitization utilities for API endpoints
 * Provides protection against SQL injection and parameter validation
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: any;
  error?: string;
}

/**
 * Sanitizes and validates numeric ID parameters
 * @param value - The value to sanitize (string, number, or undefined)
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult with sanitized value or error
 */
export function sanitizeNumericId(value: string | number | undefined | null, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, sanitizedValue: undefined };
  }

  // Convert to string for processing
  const stringValue = String(value).trim();

  // Check for empty string after trim
  if (stringValue === '') {
    return { isValid: true, sanitizedValue: undefined };
  }

  // Check for SQL injection patterns
  const sqlInjectionPatterns = [
    /['";]/,                    // Single/double quotes, semicolons
    /(\-\-|\/\*|\*\/)/,        // Comment patterns
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,  // SQL keywords
    /(\bor\b|\band\b)/i,       // OR/AND operators
    /[<>]/,                    // Comparison operators in unexpected context
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(stringValue)) {
      return {
        isValid: false,
        error: `${fieldName} contains invalid characters`
      };
    }
  }

  // Check if it's a valid number
  if (!/^\d+$/.test(stringValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`
    };
  }

  const numericValue = parseInt(stringValue, 10);

  // Check for valid range
  if (numericValue < 1 || numericValue > Number.MAX_SAFE_INTEGER) {
    return {
      isValid: false,
      error: `${fieldName} must be a positive number`
    };
  }

  return {
    isValid: true,
    sanitizedValue: numericValue
  };
}

/**
 * Sanitizes boolean parameters (true/false, 1/0, yes/no)
 * @param value - The value to sanitize
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult with sanitized boolean value
 */
export function sanitizeBoolean(value: string | boolean | undefined | null, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, sanitizedValue: false };
  }

  if (typeof value === 'boolean') {
    return { isValid: true, sanitizedValue: value };
  }

  const stringValue = String(value).toLowerCase().trim();

  const truthyValues = ['true', '1', 'yes', 'on'];
  const falsyValues = ['false', '0', 'no', 'off', ''];

  if (truthyValues.includes(stringValue)) {
    return { isValid: true, sanitizedValue: true };
  }

  if (falsyValues.includes(stringValue)) {
    return { isValid: true, sanitizedValue: false };
  }

  return {
    isValid: false,
    error: `${fieldName} must be a valid boolean value (true/false, 1/0, yes/no)`
  };
}

/**
 * Sanitizes string parameters with length and content validation
 * @param value - The value to sanitize
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns ValidationResult with sanitized string value
 */
export function sanitizeString(
  value: string | undefined | null,
  fieldName: string,
  options: {
    maxLength?: number;
    minLength?: number;
    allowEmpty?: boolean;
    alphanumericOnly?: boolean;
  } = {}
): ValidationResult {
  const {
    maxLength = 255,
    minLength = 0,
    allowEmpty = true,
    alphanumericOnly = false
  } = options;

  if (value === undefined || value === null) {
    if (allowEmpty) {
      return { isValid: true, sanitizedValue: undefined };
    } else {
      return { isValid: false, error: `${fieldName} is required` };
    }
  }

  // Basic sanitization - trim whitespace
  const sanitizedValue = String(value).trim();

  // Check for empty after trim
  if (sanitizedValue === '' && !allowEmpty) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }

  // Length validation
  if (sanitizedValue.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long`
    };
  }

  if (sanitizedValue.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters long`
    };
  }

  // Content validation
  if (alphanumericOnly && !/^[a-zA-Z0-9\s-_]*$/.test(sanitizedValue)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, numbers, spaces, hyphens, and underscores`
    };
  }

  // Check for potential script injection
  const scriptPatterns = [
    /<script/i,
    /<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onevent handlers
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of scriptPatterns) {
    if (pattern.test(sanitizedValue)) {
      return {
        isValid: false,
        error: `${fieldName} contains potentially harmful content`
      };
    }
  }

  return {
    isValid: true,
    sanitizedValue: sanitizedValue || undefined
  };
}

/**
 * Sanitizes date string parameters
 * @param value - The date value to sanitize
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult with sanitized date value
 */
export function sanitizeDate(value: string | Date | undefined | null, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, sanitizedValue: undefined };
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return { isValid: false, error: `${fieldName} is not a valid date` };
    }
    return { isValid: true, sanitizedValue: value };
  }

  const stringValue = String(value).trim();

  // Check for SQL injection in date strings
  if (/['";]/.test(stringValue)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters`
    };
  }

  // Validate ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDatePattern.test(stringValue)) {
    return {
      isValid: false,
      error: `${fieldName} must be in ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`
    };
  }

  const date = new Date(stringValue);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: `${fieldName} is not a valid date`
    };
  }

  return {
    isValid: true,
    sanitizedValue: date
  };
}

/**
 * Validates and sanitizes query parameters from NextRequest
 * @param searchParams - URLSearchParams from NextRequest
 * @param schema - Object defining expected parameters and their types
 * @returns Object with sanitized values and any validation errors
 */
export function sanitizeQueryParams(
  searchParams: URLSearchParams,
  schema: Record<string, {
    type: 'number' | 'boolean' | 'string' | 'date';
    required?: boolean;
    options?: any;
  }>
): {
  isValid: boolean;
  data: Record<string, any>;
  errors: string[];
} {
  const data: Record<string, any> = {};
  const errors: string[] = [];

  for (const [fieldName, config] of Object.entries(schema)) {
    const value = searchParams.get(fieldName);

    let result: ValidationResult;

    switch (config.type) {
      case 'number':
        result = sanitizeNumericId(value, fieldName);
        break;
      case 'boolean':
        result = sanitizeBoolean(value, fieldName);
        break;
      case 'string':
        result = sanitizeString(value, fieldName, config.options || {});
        break;
      case 'date':
        result = sanitizeDate(value, fieldName);
        break;
      default:
        result = { isValid: false, error: `Unknown type for field ${fieldName}` };
    }

    if (!result.isValid) {
      errors.push(result.error!);
    } else if (result.sanitizedValue !== undefined) {
      data[fieldName] = result.sanitizedValue;
    } else if (config.required) {
      errors.push(`${fieldName} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    data,
    errors
  };
}