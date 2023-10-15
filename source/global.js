import { makeToastNotification } from "./assets/scripts/helper.js";

// window.ipcRenderer.on("count", (event, count) => {
//     makeToastNotification(count);
// });

// // for view
// IPC_MAIN.handle("count-up-to-10", async event => {

//     const response = new Response()

//     for (let index = 1; index <= 10; index++) {
//         await new Promise(resolve => setTimeout(resolve, 1000))
//         event.sender.send("count", index)
//         console.log(["\n\t", "count: ", index].join(""));
//     }

//     return response.success().addToast("Count completed").getResponse()

// })
