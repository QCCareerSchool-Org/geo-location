import type { GeoLocation } from '../domain/geoLocation';

export const getCSS = (geoLocation: GeoLocation, important = true): string => {
  const imp = important ? '!important' : '';
  let css = `/* ${JSON.stringify(geoLocation)} */`;
  if (geoLocation.countryCode === 'CA') {
    css += `
.no-ca{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}`;
    if (geoLocation.provinceCode === 'ON') {
      css += `
.no-ontario{display:none${imp}}`;
    } else {
      css += `
.ontario-only{display:none${imp}}`;
    }
  } else if (geoLocation.countryCode === 'US') {
    css += `
.no-us{display:none${imp}}
.ca-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'GB', 'IM', 'GG', 'JE' ].includes(geoLocation.countryCode)) {
    css += `
.no-gb{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'AU', 'CX', 'CC' ].includes(geoLocation.countryCode)) {
    css += `
.no-au{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'NZ', 'PN' ].includes(geoLocation.countryCode)) {
    css += `
.no-nz{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else {
    css += `
.no-xx{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  }
  return css;
};
