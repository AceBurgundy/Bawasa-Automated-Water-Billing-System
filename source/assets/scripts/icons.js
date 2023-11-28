/**
 * 
 * [...[].concat(classList)].join(' ') helps convert an array or a single element into a single string
 * 
 * [].concat(classList) means combine classList and [].
 *          
 *          if classList = "single" 
   result will be ["single"]
 *          
 *          if classList = ["single", "double"] 
   result will be [["single", "double"]]
 * 
 * [...] means spread the result of the previous
 * 
 *          ["single"] will still be ["single"]
 *          
 *          [["single", "double"]] will now be ["single", "double"]
 * 
 * .join(' ') means join all results with a ' '
 * 
 *          ["single"] will now be "single" 
 * 
 *          ["single", "double"] will now be "single double"
 */
const setClass = classList => [...[].concat(classList)].join(' ')

export const icons = {
    arrowIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" width="11" height="20" ><path fill-rule="evenodd" d="M.366 19.708c.405.39 1.06.39 1.464 0l8.563-8.264a1.95 1.95 0 0 0 0-2.827L1.768.292A1.063 1.063 0 0 0 .314.282a.976.976 0 0 0-.011 1.425l7.894 7.617a.975.975 0 0 1 0 1.414L.366 18.295a.974.974 0 0 0 0 1.413"></path></svg>`,
    usersIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 256 256" ><rect width="256" height="256" fill="none"></rect> <circle cx="88" cy="108" r="52" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle> <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M155.41251 57.937A52.00595 52.00595 0 1 1 169.52209 160M15.99613 197.39669a88.01736 88.01736 0 0 1 144.00452-.00549M169.52209 160a87.89491 87.89491 0 0 1 72.00032 37.3912"></path></svg>`,
    userIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 256 256" ><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="96" r="64" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002"></path></svg>`,
    billIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 32 32" ><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m25 29-1.59-.8a6 6 0 0 0-4.91-.2L16 29l-2.5-1a6 6 0 0 0-4.91.2L7 29V3h18ZM11 7h8M11 11h6M11 15h10"></path></svg>`,
    powerIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 256 256" ><rect width="256" height="256" fill="none"></rect><line x1="127.992" x2="127.992" y1="48.003" y2="124.003" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M176.00189,54.23268a88,88,0,1,1-96.00346-.00021"></path></svg>`,
    menuIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 24 24" ><path d="M12,7a2,2,0,1,0-2-2A2,2,0,0,0,12,7Zm0,10a2,2,0,1,0,2,2A2,2,0,0,0,12,17Zm0-7a2,2,0,1,0,2,2A2,2,0,0,0,12,10Z"/></svg>`,
    editIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 24 24" ><path d="M5,18H9.24a1,1,0,0,0,.71-.29l6.92-6.93h0L19.71,8a1,1,0,0,0,0-1.42L15.47,2.29a1,1,0,0,0-1.42,0L11.23,5.12h0L4.29,12.05a1,1,0,0,0-.29.71V17A1,1,0,0,0,5,18ZM14.76,4.41l2.83,2.83L16.17,8.66,13.34,5.83ZM6,13.17l5.93-5.93,2.83,2.83L8.83,16H6ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>`,
    payIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 32 32" ><path d="M16 17c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6z"></path><path d="M16.4 13.2h-.8a2.613 2.613 0 0 1-2.493-1.864 1 1 0 1 1 1.918-.565c.075.253.312.43.575.43h.8a.6.6 0 0 0 0-1.201h-.8C14.166 10 13 8.833 13 7.4s1.166-2.6 2.6-2.6h.8c1.121 0 2.111.714 2.466 1.778a1 1 0 1 1-1.897.633.598.598 0 0 0-.569-.411h-.8a.6.6 0 0 0 0 1.2h.8c1.434 0 2.6 1.167 2.6 2.6s-1.166 2.6-2.6 2.6z"></path><path d="M16 6c-.271 0-.521-.11-.71-.29-.04-.05-.09-.1-.12-.16a.556.556 0 0 1-.09-.17.672.672 0 0 1-.061-.18C15.01 5.13 15 5.07 15 5c0-.26.109-.52.29-.71.37-.37 1.04-.37 1.42 0 .18.19.29.45.29.71 0 .07-.01.13-.021.2a.606.606 0 0 1-.06.18.578.578 0 0 1-.09.17c-.04.06-.08.11-.12.16-.189.18-.449.29-.709.29zm0 8c-.271 0-.521-.11-.71-.29-.04-.05-.09-.10-.12-.16a.556.556 0 0 1-.09-.17.672.672 0 0 1-.061-.18c-.009-.07-.019-.13-.019-.2 0-.26.109-.52.29-.71.37-.37 1.04-.37 1.42 0 .18.19.29.45.29.71 0 .07-.01.13-.021.2a.606.606 0 0 1-.06.18.578.578 0 0 1-.09.17c-.04.06-.08.11-.12.16-.189.18-.449.29-.709.29zm2 17H2a1 1 0 0 1-1-1v-9c0-.265.105-.52.293-.707C1.527 20.058 3.653 18 6 18c1.944 0 4.452 1.469 5.295 2H16a3.004 3.004 0 0 1 2.955 3.519l7.891-3.288a2.995 2.995 0 0 1 2.818.273A2.993 2.993 0 0 1 31 23a1 1 0 0 1-.496.864l-12 7A1.003 1.003 0 0 1 18 31zM3 29h14.729l11.14-6.498a1.01 1.01 0 0 0-.314-.334.984.984 0 0 0-.939-.091l-9.23 3.846A1.007 1.007 0 0 1 18 26h-8a1 1 0 1 1 0-2h6a1.001 1.001 0 0 0 0-2h-5c-.197 0-.391-.059-.555-.167C9.68 21.323 7.387 20 6 20c-1.09 0-2.347.88-3 1.439V29z"></path></svg>`,
    printIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 24 24" ><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>`,
    archiveIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" viewBox="0 0 24 24" ><path d="M10,13h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2ZM19,3H5A3,3,0,0,0,4,8.82V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V8.82A3,3,0,0,0,19,3ZM18,18a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V9H18ZM19,7H5A1,1,0,0,1,5,5H19a1,1,0,0,1,0,2Z"/></svg>`,
    clipboardIcon: (id, classList) => `<svg id="${ id || '' }" class="${ setClass(classList) }" data-name="Layer 1" viewBox="0 0 32 32" ><path d="M24,30H8a3,3,0,0,1-3-3V7A3,3,0,0,1,8,4h2a1,1,0,0,1,0,2H8A1,1,0,0,0,7,7V27a1,1,0,0,0,1,1H24a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H22a1,1,0,0,1,0-2h2a3,3,0,0,1,3,3V27A3,3,0,0,1,24,30Z"></path><path d="M22,8H10A1,1,0,0,1,9,7V5a3,3,0,0,1,3-3h1.17a3,3,0,0,1,5.66,0H20a3,3,0,0,1,3,3V7A1,1,0,0,1,22,8ZM11,6H21V5a1,1,0,0,0-1-1H18a1,1,0,0,1-1-1,1,1,0,0,0-2,0,1,1,0,0,1-1,1H12a1,1,0,0,0-1,1Zm8-3h0Z"></path></svg>`
}

// xmlns = xmlns="http://www.w3.org/2000/svg"