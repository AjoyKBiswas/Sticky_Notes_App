// console.log('Linked');
let add_button = document.querySelector(".add-button");
let remove_button = document.querySelector(".remove-button");
let modal_cont = document.querySelector(".modal-cont");
let main_cont = document.querySelector(".main-cont");
let save_button = document.querySelector(".save-button");
let priority_colors = document.querySelectorAll(".priority-color");
let toolbox_colors = document.querySelectorAll(".color");

//let ticket_cont;
// let textarea_cont = document.querySelector(".textarea-cont");
let add_flag = false;
let remove_flag = false;
let ticket_colors = ["red", "green", "blue", "black"];
//if no priority color is chosen, then default color black has to be attached to the ticket. 
//So, by default we have to depct that black is always activated as default
let default_ticket_color = ticket_colors[ticket_colors.length - 1];
let all_ticket_obj_array = [];

//If localstorage is non-empty, then on opening the webpage, we should display the existing tickets
if(localStorage.getItem("JIRA-tickets")){
    //Put back the content of localstorage to ticket object array, but after parsing, because data was stored in string format
    all_ticket_obj_array = JSON.parse(localStorage.getItem("JIRA-tickets"));
    //adding back all tickets from ticket object array & displaying them
    all_ticket_obj_array.forEach((ticket_obj) => {
        createNewTicket(ticket_obj.selected_ticket_color, ticket_obj.ticket_task, ticket_obj.ticket_id);
    })
}

handle_ticket_removal();

add_button.addEventListener("click", (event) => {
    //console.log('clicked');
    //1st time, add_flag will be false, so when clicked, make it true, so that it goes into if condition
    add_flag = !add_flag;
    //add_flag= true -> display modal
    if(add_flag===true){
        modal_cont.style.display = "flex";
    }
    else{
        modal_cont.style.display = "none";
    }
})

//Write some task name, then may chose a color, then press Save button to save ticket -> add event listener to Save button
function createNewTicket(selected_ticket_color, ticket_task, existing_ticket_id){
    let ticket_id = (existing_ticket_id || shortid());
    //console.log(ticket_id);
    // if(new_ticket_id===undefined){  //will enter if condition if new ticket is being created 1st time using shortid()
    //     ticket_id = shortid();
    // }
    // else{  //enter else condition if ticket with id was created & then deleted & re-created when filtering using color
    //     ticket_id = new_ticket_id;
    // }
    let ticket_cont = document.createElement("div");
    ticket_cont.setAttribute("class", "ticket-cont");
    //Ideally task shouldn't be empty, so return.
    if(ticket_task===""){
        alert("Task can't be empty, please retry!");
        return;
    }
    ticket_cont.innerHTML = `<div class="ticket-color ${selected_ticket_color}"></div>
                      <div class="ticket-id">#${ticket_id}</div>
                      <div class="task-area">${ticket_task}</div>
                      <div class="ticket-lock">
                        <i class="fa-solid fa-lock"></i>
                      </div>
                      <div class="ticket-remove">
                        <i class="fa-solid fa-xmark"></i>
                      </div>`;
    main_cont.appendChild(ticket_cont);

    //create obj of ticket created and add obj to array
    if(!existing_ticket_id){  //if ticket is being created 1st time, i.e no existing ticket id, then only push in ticket obj array
        all_ticket_obj_array.push({selected_ticket_color, ticket_task, ticket_id});
        localStorage.setItem("JIRA-tickets", JSON.stringify(all_ticket_obj_array));
    }
    //console.log(all_ticket_obj_array);
    remove_ticket(ticket_cont, ticket_id);
    handle_ticket_lock(ticket_cont, ticket_id);
    modify_ticket_priority_color(ticket_cont, ticket_id);
}

save_button.addEventListener("click", (event) => {
    add_flag = false;
    let textarea_cont = document.querySelector(".textarea-cont");
    //ticket_id either we can generate some unique integer, or we can use online external library for unique id
    //shortid() is the inbuild function call to generate unique id from external library
    //createNewTicket(default_ticket_color, textarea_cont.value, shortid());
    createNewTicket(default_ticket_color, textarea_cont.value);
    // //Text area has to be reset after adding ticket
    // textarea_cont.value = "";
    // //Modal has to be vanished after adding ticket
    // modal_cont.style.display = "none";
    setModalToDefault(textarea_cont);  //modal has to be reset to default
})

//Event listener on the priority color boxes on modal, to choose a ticket priority color
priority_colors.forEach((colorElem, index) => {
    colorElem.addEventListener("click", (event) => {
        //When clicked on a color, first remove existing border on color, if any
        priority_colors.forEach((color) => {
            color.classList.remove("border");
        })
        //Add border to the color clicked
        colorElem.classList.add("border");
        //colorElem has 2 classes, e.g-<red, priority-color>, which came from priority-colors, so setting gloabl var default_ticket-color to classList[0]
        default_ticket_color = colorElem.classList[0];
    })
})

//function for deleting specific ticket
function remove_ticket(selected_ticket, selected_ticket_id){
    let ticket_remove_button = selected_ticket.querySelector(".ticket-remove");
    //click X, click on the ticket we want to delete, it will get deleted, for that we need to have remove functionality added to all tickets
    ticket_remove_button.addEventListener("click", (event) => {
        //remove_flag = !remove_flag;
        let ticket_obj_index = getTicketIndexById(selected_ticket_id);
        //object_array.splice(index, number of elements to be deleted starting from the index)
        all_ticket_obj_array.splice(ticket_obj_index, 1);
        //Updating the local storage
        localStorage.setItem("JIRA-tickets", JSON.stringify(all_ticket_obj_array));
        //actually deleting the ticket from HTML element
        selected_ticket.remove();
    })
}

//function for deleting all tickets at once
function handle_ticket_removal(){
    remove_button.addEventListener("click", (event) => {
        let all_tickets = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i<all_tickets.length; i++){
            all_tickets[i].remove();
        }
        //console.log(all_ticket_obj_array);
        //when we want to delete all tickets at once, empty both loval storage & ticket object array
        localStorage.clear();
        all_ticket_obj_array.splice(0, all_ticket_obj_array.length);
        //console.log(all_ticket_obj_array);
    })
}

function handle_ticket_lock(selected_ticket, selected_ticket_id){
    let ticket_lock_element = selected_ticket.querySelector(".ticket-lock");
    let ticket_lock = ticket_lock_element.children[0];  //fetching fa-lock/fa-unlock element icon
    let task_area_text = selected_ticket.querySelector(".task-area");
    ticket_lock.addEventListener("click", (event) => {
        if(ticket_lock.classList.contains("fa-lock")){
            ticket_lock.classList.remove("fa-lock");
            ticket_lock.classList.add("fa-lock-open");
            //If unlocked, set contenteditable=true, now task area text can be edited.
            task_area_text.setAttribute("contenteditable", "true");
        }
        else{
            ticket_lock.classList.remove("fa-lock-open");
            ticket_lock.classList.add("fa-lock");
            //if locked, set contenteditable=false, so that task cant be edited.
            task_area_text.setAttribute("contenteditable", "false");
        }
        //Get index of ticket from ticket object array
        let ticket_obj_index = getTicketIndexById(selected_ticket_id);
        //Modify ticket data in local storage when ticket task is modified
        all_ticket_obj_array[ticket_obj_index].ticket_task = task_area_text.innerText;
        localStorage.setItem("JIRA-tickets", JSON.stringify(all_ticket_obj_array));
    });
}
function getTicketIndexById(target_ticket_id){
    let ticket_index = all_ticket_obj_array.findIndex((ticket_obj) => {
        return (ticket_obj.ticket_id === target_ticket_id);
    })
    return ticket_index;
}

function modify_ticket_priority_color(selected_ticket, selected_ticket_id){
    //let class_index = 0;
    let ticket_color_elem = selected_ticket.querySelector(".ticket-color");
    ticket_color_elem.addEventListener("click", (event) => {
        let curr_ticket_color = ticket_color_elem.classList[1];
        //console.log('curr_ticket_color:', curr_ticket_color);
        let curr_ticket_color_idx = ticket_colors.findIndex((color) => {
            return (curr_ticket_color === color)
        })
        curr_ticket_color_idx++;
        //To avoid going out of ticket_colors index, use modulo
        let next_ticket_color_idx = (curr_ticket_color_idx % (ticket_colors.length));
        let next_ticket_color = ticket_colors[next_ticket_color_idx];
        //console.log('next_ticket_color:', next_ticket_color);
        ticket_color_elem.classList.remove(curr_ticket_color);
        ticket_color_elem.classList.add(next_ticket_color);

        //First getting index of ticket obj in array by ticket ID
        let ticket_obj_index = getTicketIndexById(selected_ticket_id);
        //Modifying tickets object array with newly modified color
        all_ticket_obj_array[ticket_obj_index].selected_ticket_color = next_ticket_color;
        //Modify ticket data in local storage when ticket priority color is modified
        localStorage.setItem("JIRA-tickets", JSON.stringify(all_ticket_obj_array));
    })
}

toolbox_colors.forEach((tbcolor_elem) => {
    //we can also use for loop for iterating over toolbox_colors
    tbcolor_elem.addEventListener("click", (event) => {
        let curr_tbcolor = tbcolor_elem.classList[0];
        //Instead of collecting all ticket elements created, we will maintain an array of JS objects having ticket_id, ticket_color etc,
        //which we can access to filter out tickets based on ticket colors
        let filtered_ticket_array = all_ticket_obj_array.filter((ticket_obj, index) => {
            return (ticket_obj.selected_ticket_color === curr_tbcolor);
        })
        //Before displaying only the filtered tickets, we need to vanihs all tickets temporarily
        let all_tickets = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i<all_tickets.length; i++){
            all_tickets[i].remove();
        }
        // all_tickets.forEach((ticket) => {
        //     ticket.remove();
        // })
        //Only re-create tickets for filtered ticket colors
        //console.log(filtered_ticket_array);
        filtered_ticket_array.forEach((ticket_obj, index) => {
            createNewTicket(ticket_obj.selected_ticket_color, ticket_obj.ticket_task, ticket_obj.ticket_id);
        })
        //code for re-displaying all tickets
        tbcolor_elem.addEventListener("click", (event) => {
            //remove all filtered tickets to display all tickets
            let all_tickets = document.querySelectorAll(".ticket-cont");
            for(let i = 0; i<all_tickets.length; i++){
                all_tickets[i].remove();
            }
            //Re-creating all tickets to display them
            all_ticket_obj_array.forEach((ticket_obj) => {
                createNewTicket(ticket_obj.selected_ticket_color, ticket_obj.ticket_task, ticket_obj.ticket_id);
            })
        })
    })
})

function setModalToDefault(textarea_cont){
    //Text area has to be reset
    textarea_cont.value = "";
    //Modal has to be vanished
    modal_cont.style.display = "none";
    //first delete border from all/any priority color
    priority_colors.forEach((colorElem, index) => {
        colorElem.classList.remove("border");
    })
    //Add border to the color clicked
    priority_colors[priority_colors.length-1].classList.add("border");
    //setting gloabl var default_ticket-color to classList[0]
    default_ticket_color = ticket_colors[ticket_colors.length-1];
}