jQuery(document).ready(function(){
    
     // ---------MANUAL TRANSACTION START------------
    
    let append = 2;
    
    $("#add_item").click(function(){
        event.preventDefault();
        $(".items_holder").append(`
        <div class="new_item item_${append} mt-5 w-100">
            <h2 class="text-center">ITEM ${append}</h2>
            <div class="row">
                <div class="col-12 col-md-6">
                    <label for="amount">Amount</label>
                    <input type="text" class="form-control" name="amount_${append}" id="amount_${append}" placeholder="Amount"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="appeal_id">Appeal ID</label>
                    <input type="text" class="form-control" name="appeal_id_${append}" id="appeal_id_${append}" placeholder="Appeal ID"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="amount_id">Amount ID</label>
                    <input type="text" class="form-control" name="amount_id_${append}" id="amount_id_${append}" placeholder="Amount ID" value="0"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="quantity">Quantity</label>
                    <input type="text" class="form-control" name="quantity_${append}" id="quantity_${append}" placeholder="Quantity" value="1"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="plan_id">Plan ID</label>
                    <input type="text" class="form-control" name="plan_id_${append}" id="plan_id_${append}" placeholder="Plan ID"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="sub_id">Sub ID</label>
                    <input type="text" class="form-control" name="sub_id_${append}" id="sub_id_${append}" placeholder="Sub ID"/>
                </div>
                <div class="col-12 col-md-6">
                    <label for="sub_id">Frequency</label>
                    <select name="freq_${append}" class="form-control">
                        <option value="onetime">onetime</option>
                        <option value="monthly">monthly</option>
                        <option value="yearly">yearly</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-gradient-danger waves-effect waves-light mt-5 mb-4 d-block mx-auto w-50 remove-item" data-item="${append}">REMOVE ITEM ${append}</button>
        </div>
        `);
        
        append++;
        
    });
    
    
    
    
    $(document).on("click", ".remove-item", function(event){
        event.preventDefault();
        let item = $(this).data("item");
        $(".item_" + item).remove();
        append--;
    });
    
    
    $("#manual_transation_form").submit(function(e) {
        e.preventDefault();
        
        let isValid = true;
        let formData = {};
        
        formData["date"] = $("#date").val().trim();
        formData["payment_type"] = $("#payment_type").val().trim();
        
        let requiredFields = [
            "charge_id", "payment_intent", "first_name", "last_name", "email", "amount",
            "appeal_id", "amount_id", "quantity"
        ];
        
        requiredFields.forEach(function(field) {
            $("input[name^='" + field + "']").each(function() {
                let value = $(this).val().trim();
                formData[$(this).attr("name")] = value;
                if (value === "") {
                    isValid = false;
                    $(this).addClass("is-invalid");
                } else {
                    $(this).removeClass("is-invalid");
                }
            });
        });
        
        $("select[name^='freq']").each(function() {
            let value = $(this).val();
            formData[$(this).attr("name")] = value;
            
            let planIdField = $(this).attr("name").replace("freq", "plan_id");
            let subIdField = $(this).attr("name").replace("freq", "sub_id");
            
            if (value === "monthly" || value === "yearly") {
                let planId = $("input[name='" + planIdField + "']").val().trim();
                let subId = $("input[name='" + subIdField + "']").val().trim();
                
                formData[planIdField] = planId;
                formData[subIdField] = subId;
                
                if (planId === "" || subId === "") {
                    isValid = false;
                    if (planId === "") $("input[name='" + planIdField + "']").addClass("is-invalid");
                    if (subId === "") $("input[name='" + subIdField + "']").addClass("is-invalid");
                } else {
                    $("input[name='" + planIdField + "'], input[name='" + subIdField + "']").removeClass("is-invalid");
                }
            } else {
                $("input[name='" + planIdField + "'], input[name='" + subIdField + "']").removeClass("is-invalid");
            }
        });
        
        if (!isValid) {
            alert("Kindly fill all required fields.");
            return;
        }
        
        $.ajax({
            url: "/backend/yoc/manual_transaction.php",
            type: "POST",
            data: formData,
            success: function(response) {
                if (response.indexOf("inserted") !== -1) {
                    alert("Transaction submitted successfully!");
                    $("#manual_transation_form")[0].reset();
                    $(".new_item").remove();
                    append = 2;
                } else {
                    alert("Error: " + response);
                }
            }
        });
    });
    
    // ---------MANUAL TRANSACTION END------------
    
    
    // ----------Manual Subscribtion Start----------
    
$("#manual_sub_form").on("submit", function(event) {
    event.preventDefault();
    
    // Retrieve values
    let customer_id = $("#customer_id").val().trim();
    let fname = $("#firstname").val().trim();
    let lname = $("#lastname").val().trim();
    let currency = $("#currency").val().trim();
    let email = $("#email").val().trim();
    let start_date = $("#start_date").val().trim();
    let appeal_id = $("#appeal_name").val();
    let quantity = $("#quantity").val().trim();
    let amount = $("#amount").val().trim();
    let freq = $("#freq").val();
    let charge_id = $("#charge_id").val().trim();

    // Validation rules
    let errors = [];
    if (!customer_id) errors.push("Customer ID is required.");
    else if (!fname || !/^[A-Za-z]+$/.test(fname)) errors.push("Valid first name is required.");
    else if (!lname || !/^[A-Za-z]+$/.test(lname)) errors.push("Valid last name is required.");
    else if (currency == 0) errors.push("Currency is required.");
    else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Valid email is required.");
    else if (!start_date || isNaN(new Date(start_date).getTime())) errors.push("Valid start date is required.");
    else if (appeal_id == 0) errors.push("Appeal ID is required.");
    else if (quantity < 1 || quantity == "") errors.push("The quantity should be 1 or greater.");
    else if (!amount || isNaN(amount) || amount <= 0) errors.push("Valid amount is required.");
    else if (freq == -1) errors.push("Frequency is required.");
    else if (!charge_id) errors.push("Charge ID is required.");

    // Display errors or submit the form
    if (errors.length > 0) {
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            onOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'error',
            text: errors.join("\n"),
            title: "Invalid Fields Data"
          })
        
        return;
    }

    // Submit via AJAX
    $.post("/backend/yoc/manul_sub.php", {
        customer_id: customer_id,
        fname: fname,
        lname: lname,
        currency: currency,
        email: email,
        start_date: start_date,
        appeal_id: appeal_id,
        quantity: quantity,
        amount: amount,
        freq: freq,
        charge_id: charge_id
    },
    function(req, res) {
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            onOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
          Toast.fire({
            icon: 'success',
            text: req,
            title: "Schedule Creation"
          })
    });
});
// ----------Manual Subscribtion End----------
    
    
    
    
var currentDate = new Date();
var year = currentDate.getFullYear();
var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
var day = ('0' + currentDate.getDate()).slice(-2);
var hours = ('0' + currentDate.getHours()).slice(-2);
var minutes = ('0' + currentDate.getMinutes()).slice(-2);
var seconds = ('0' + currentDate.getSeconds()).slice(-2);
var dateString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
   

    $('.auth-form-icon').click(function() {
        var passwordInput = $("#userpassword");
        var currentType = passwordInput.attr("type");
    
        if (currentType === "password") {
            passwordInput.attr("type", "text");
            $('.dripicons-lock').attr("class", "ti-unlock");
        } else {
            passwordInput.attr("type", "password");
            $('.ti-unlock').attr("class", "dripicons-lock");
        }
    });


    // -------Qurbani Report Data    --------
    $('#qurbani_form').submit((e) => {
        e.preventDefault();
    });
    
   
   
     let qurbani_txtsearch;
     let qurbani_orderid;
     let qurbani_currentPage = 1; // Initialize current page to 1
     const qurbani_rowsPerPage = 50; // Number of rows to display per page
     let qurbani_loadData = 0;
     let qurbani_runLoop = true;
    
const qurbani_fetchingData = (qurbani_txtsearch,qurbani_orderid) => {
    
    $.post('/backend/yoc/getReportData.php', {
           qurbaniReport: "qurbaniReport",
            qurbani_loadData:  qurbani_loadData,
            qurbani_txtsearch: qurbani_txtsearch,
            qurbani_orderid: qurbani_orderid
        }, (data, status) => {
            // console.log(data);
            try {
                const start = 0;
                const end = rowsPerPage;
                qurbani_displayData(data, start, end);
        } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
               }
        });
        
    
};
const qurbani_fetchingRows = ( qurbani_txtsearch,qurbani_orderid) => {
    
    $.post('/backend/yoc/getReportData.php', {
           qurbaniReport: "qurbaniReport",
            qurbani_txtsearch: qurbani_txtsearch,
              qurbani_orderid: qurbani_orderid
        }, (data, status) => {
            // console.log(data);
            try {
                updatePagination(data);
                $(".modaldx").css('display', 'none');
            } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
                }
        });
        
    qurbani_fetchingData ( qurbani_txtsearch,qurbani_orderid);
};    

// Function to display data for the current page
function qurbani_displayData(data, start, end) {
    
    $('#datatable tbody').empty();
 
    for (let i = start; i < end; i++) {
    const items = data[i];
    try{
        const newData = `
            <tr>
                <td>${i+1}</td>
                <td>${items['date']}</td>
                <td>${items['firstname']}  ${items['lastname']} </td>
                <td>${items['email']}</td>
                <td>${items['totalamount']}</td>
                <td>${items['notes']}</td>
                <td>${items['status']}</td>`;
            $('#datatable tbody').append(newData);
        }catch(e){
            
        }
    }
    
}

// Function to update the pagination controls
function qurbani_updatePagination(data) {
    
    const totalPages = Math.ceil(data / rowsPerPage);
    $('#dataCounter p').html(`Filterd Value: ${data}`);
    $('#pagination').html(`
        <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Next</button>
    `);

    // Event handler for "Previous" button
    $('#prevPage').click(() => {
        if (currentPage > 1) {
            currentPage--;
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
             if(qurbani_loadData > 0){
                 qurbani_loadData -= 50;
             }
            qurbani_fetchingData(qurbani_txtsearch,qurbani_orderid);
            qurbani_updatePagination(data);
        }
    });

    // Event handler for "Next" button
    $('#nextPage').click(() => {
        if (currentPage < totalPages) {
            currentPage++;
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
            qurbani_loadData += 50;
            qurbani_fetchingData(qurbani_txtsearch,qurbani_orderid);
            qurbani_updatePagination(data);
        }
    });
}

$('#qurbaniReport').click(() => {
    
    currentPage = 1;
    qurbani_loadData = 0;
    // runLoop = true;
    Donation_btn = false;  
    $(".modaldx").css('display', 'block');
    qurbani_txtsearch = $('#txtsearch').val();
    qurbani_orderid = $('#orderid').val();
   qurbani_fetchingRows(qurbani_txtsearch,qurbani_orderid);
        
});
        


$("#qurbaniDetail").click(function() {
    $(".modaldx").css('display', 'block');
    event.preventDefault();
   
    const txtsearch = $('#txtsearch').val();
    const orderid = $('#orderid').val();
    
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { qurbaniDetail: true ,
            txtsearch: txtsearch,
            orderid :orderid
        },
        success: function(response) {
           if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "AfghanRelief_QurbaniDetailReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
          $(".modaldx").css('display', 'none');
        },
    });
});




    //------Update Profile---------
    $('.upload_image').click(function() {
        event.preventDefault();
        $('#user_profile').click();
    });
    
    const background = $('.user_profile_image').attr('bg');
    
    let update_profile_url = false;
    
    let file = "";
    
    $('#user_profile').change(function() {
        file = this.files[0];
     //   console.log(file);
        
        let fetch_check = 'true';
        
        if(file.size > 2000000){
            fetch_check = 'false';
            alert('Maximum size for uploading pic is 2mb');
        }
        
        if(file.type != "image/png" && file.type != "image/jpg" && file.type != "image/jpeg" && file.type != "image/webp"){
            fetch_check = 'false';
            alert('Only jpg and png files are allowed!');
        }
        
        if (file && fetch_check == "true") {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('.user_profile_image').css('background-image', `url(${e.target.result})`);
                update_profile_url = true;
            };
            reader.readAsDataURL(file);
        }else{
            fetch_check = 'true';
            update_profile_url = false;
        }
        
    });
    
    $('.clear_image').click(function() {
        event.preventDefault();
        update_profile_url = false;
        $('.user_profile_image').css('background-image', `url('${background}')`);
    });
    
    
    $('#update_profile').click(function(){
        
        const name = $('#username').val();
        const dname = $('#display_name').val();
        const email = $('#useremail').val();
        const role = $('#user_role').val();
        const pass = $('#password').val();
        
        var formData = new FormData();
        
        formData.append('update_user_name', name);
        formData.append('user_profile', file);
        formData.append('dname', dname);
        formData.append('email', email);
        formData.append('role', role);
   
        
        $.ajax({
            url: '/backend/yoc/getReportData.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
                // console.log(data);
                if(data == "updated"){
                    location.reload();
                }
            }
        });
        
    });
    
     // ------------Employee Report Start------------

let employee_start_date, employee_end_date, employee_email;

$('#employee_btn').click((e) => {
    e.preventDefault();
    loadDataEmployee = 0;
    currentPageEmployee = 1;
    employee_start_date = $('#fromDate').val();
    employee_end_date = $('#toDate').val();
    employee_email = $('#email').val();
     $(".modaldx").css('display', 'block');
    const GetDiv = document.getElementById("pagination");
    if(GetDiv === null){
        $('#data').append('<div id="pagination"></div>');
    }
    fetchingRowsEployee(employee_start_date, employee_end_date, employee_email);
})
   
let currentPageEployee = 1; // Initialize current page to 1
const rowsPerPageEployee = 50; // Number of rows to display per page
let loadDataEployee = 0;
    
const fetchingDataEployee = (employee_start_date, employee_end_date, employee_email) => {
    
    //console.log(loadDataEployee);
    
    $.post('/backend/yoc/getReportData.php', {
           employeeReport: "employeeReport",
           startDate: employee_start_date,
           endDate: employee_end_date,
           email: employee_email,
           loadData: loadDataEployee
        }, (data, status) => {
            try {
                const start = 0;
                const end = rowsPerPage;
                displayDataEployee(data, start, end);
        } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
                    // console.log(`Error: ${e}`);
                }
        });
        
    
};
const fetchingRowsEployee = (employee_start_date, employee_end_date, employee_email) => {
    
    $.post('/backend/yoc/getReportData.php', {
           employeeReport: "employeeReport",
           startDate: employee_start_date,
           endDate: employee_end_date,
           email: employee_email
        }, (data, status) => {
            try {
                updatePaginationEployee(data);
                $(".modaldx").css('display', 'none');
            } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
                    // console.log(`Error: ${e}`);
                }
        });
        
    fetchingDataEployee (employee_start_date, employee_end_date, employee_email);
};    

// Function to display data for the current page of Schedule report
function displayDataEployee(data, start, end) {

// console.log(data);

 $('#datatable tbody').empty();
 for (let i = start; i < end; i++) {
        const items = data[i];
        try{
            const newData = `
            <tr>
                <td>${i+1}</td>
                <td>${items['email']}</td>
                <td>${items['lastname']}</td>
                <td>${items['company_name']}</td>
                <td>${items['company_email']}</td>
                <td>${items['No_of_transaction']}</td>
                <td>${items['Total_Amount']}</td>
            </tr>`;
            $('#datatable tbody').append(newData);
        }catch(e){
            // console.log(`Error: ${e}`);
        }
    }
}

// Function to update the pagination controls of Employee Report
function updatePaginationEployee(data) {
    const totalPages = Math.ceil(data / rowsPerPage);
     $("#dataCounter p").html(`Filtered Value: ${data}`);
    $('#pagination').html(`
        <button id="prevPage" ${currentPageEmployee === 1 ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Previous</button>
        <span>Page ${currentPageEmployee} of ${totalPages}</span>
        <button id="nextPage" ${currentPageEmployee === totalPages ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Next</button>
    `);

    // Event handler for "Previous" button
    $('#prevPage').click(() => {
        if (currentPageEmployee > 1) {
            currentPageEmployee--;
            const start = (currentPageEployee - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
             if(loadDataEployee > 0){
                 loadDataEployee -= 50;
             }
            fetchingDataEployee(employee_start_date, employee_end_date, employee_email);
            updatePaginationEployee(data);
        }
    });

    // Event handler for "Next" button
    $('#nextPage').click(() => {
        if (currentPageEmployee < totalPages) {
            currentPageEmployee++;
            const start = (currentPageEployee - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
            loadDataEployee += 50;
            fetchingDataEployee(employee_start_date, employee_end_date, employee_email);
            updatePaginationEployee(data);
        }
    });
}

$("#employee_export_btn").click(function() {
    event.preventDefault();
    $(".modaldx").css('display', 'block');
    employee_start_date = $('#fromDate').val();
    employee_end_date = $('#toDate').val();
    employee_email = $('#email').val();
    
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: {employee_export_btn: 'employee_export_btn',
            startDate: employee_start_date,
           endDate: employee_end_date,
           email: employee_email,
           
        },
        success: function(response) {
            $(".modaldx").css('display', 'none');
            
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "AfghanRelief_EmployeeReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

        },
    });
    
});

    // ------------Employee Report End------------

    // ------------Appeal Report Start------------
    $('#btnexport_appeal_report').click(() => {
        const startDate = $('#from').val();
        const endDate = $('#to').val();
        const appealName = $('#appeal').val();
        $(".modaldx").css('display', 'block');
        $.post('/backend/yoc/getReportData.php',
        {
            AppealReport: true,
            startDate: startDate,
            endDate: endDate,
             appealName:appealName
        },
        (data, status) => {
           if (data) {
            var blob = new Blob([data]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "AfghanRelief_AppealReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
         $(".modaldx").css('display', 'none');
        });
    });
    // ------------Appeal Report End------------

     // ------------Donor Report Start------------
    $('#btnexport_donor_report').click(() => {
        const email = $('#email').val();
        const startDate = $('#fromDate').val();
        const endDate = $('#toDate').val();
        const country = $('#country').val();
        $(".modaldx").css('display', 'block');
        $.post('/backend/yoc/getReportData.php',
        {
            donorReport: true,
            email: email,
            startDate: startDate,
            endDate: endDate,
            country: country
        },
        (data, status) => {
          if (data) {
            var blob = new Blob([data]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
             link.download = "AfghanRelief_DonorReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
         $(".modaldx").css('display', 'none');
        });
    });
    // ------------Donor Report End------------
    
     // ------------Donor Detail Report Start------------
    $('#btnexport_donor_report_detail').click(() => {
        const email = $('#email').val();
        const startDate = $('#fromDate').val();
        const endDate = $('#toDate').val();
        const country = $('#country').val();
        $(".modaldx").css('display', 'block');
        $.post('/backend/yoc/getReportData.php',
        {
            donorDetailReport: true,
            email: email,
            startDate: startDate,
            endDate: endDate,
            country: country
        },
        (data, status) => {
            
            if (data) {
            var blob = new Blob([data]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "AfghanRelief_DonorDetailReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
         $(".modaldx").css('display', 'none');
        });
    });
    // ------------Donor Detail Report End------------


    
    
    // monthly report ny saad (27/9/2023)
      $("#btnexport_monthly_report").click(function() {
            $(".modaldx").css('display', 'block');
            event.preventDefault();
            let from = $('#from').val();
            let to = $('#to').val();
        
            $.ajax({
                type: "POST",
                url: "/backend/yoc/getmonthly_report.php",
                data: { btnexport_monthly_report: true ,
                    from: from,
                    to: to,
                },
                success: function(response) {
                  
                 if (response) {
                    var blob = new Blob([response]);
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = "AfghanRelief_MonthlyReport_" + dateString + ".csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    alert("No Data Found");
                }
                   $(".modaldx").css('display', 'none');
                },
            });
        });



 $("#btnexport_daily_report").click(function() {
    $(".modaldx").css('display', 'block');
    event.preventDefault();
    let from = $('#from').val();
    let to = $('#to').val();

    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { btnexport_daily: true ,
            from: from,
            to: to,
        },
        success: function(response) {
          
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
             link.download = "AfghanRelief_DailyReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

           $(".modaldx").css('display', 'none');
        },
    });
});

 $("#btnexportdaily_report").click(function() {
    $(".modaldx").css('display', 'block');
    event.preventDefault();
    let from = $('#from').val();
    let to = $('#to').val();
    let appealname = $('#appealname').val();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/newreports.php",
        data: { btnexportdaily: true ,
            from: from,
            to: to,
            appealname:appealname,
        },
        success: function(response) {
          
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
             link.download = "AfghanRelief_DailyReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

           $(".modaldx").css('display', 'none');
        },
    });
});


  $('#role_id').change(function() {
        var roleId = $(this).val();
        // Send an AJAX request to get permissions for the selected role
         $('input[type="checkbox"]').prop('checked', false);
        $.ajax({
            type: 'POST',
            url: '/backend/yoc/getReportData.php', 
            data: {role_id: roleId},
            dataType: 'json',
            success: function(data) {
                //console.log(data);
                $.each(data, function(index, permissionId) {
                    $('#permission_' + permissionId).prop('checked', true);
                });
            },
            error: function() {
                // Handle error if AJAX request fails
                alert('Error occurred while fetching permissions.');
            }
        });
    });


$('#assign_permission').click(function(e) {
    e.preventDefault();
    var role_id = $('#role_id').val();
    var permissions = $('input[name="permissions[]"]:checked').map(function() {
        return this.value;
    }).get();

    $.ajax({
        type: 'POST',
        url: '/backend/yoc/getReportData.php',
        data: {
            permission: true ,
            role_id: role_id,
            permissions: permissions
        },
        success: function(response) {
            if(response.indexOf("Permissions Granted Successfully!") >= 0) {
                callPopup(response);
            
                 window.location = "/backend/pages/permission/prevelages.php";
                 
            } else {
                ShowValidate("Error: while updating Service.");
            }
        }
    });
});



// -------Forget Password Start    --------
 jQuery("#generateotp").click(function() {
    let email = jQuery('#email').val();
    jQuery.ajax({
        type: "POST",
        url: '/backend/yoc/verification.php',
        data: { generate_otp: true ,
            email: email
        },
         dataType: "json",
        success: function(response) {
        
            if (response.status === "success") {
            
                let resetUrl = "/backend/pages/password/reset_password.php?id=" + response.userId + "&email=" + response.email;
                window.location = resetUrl;
            }
             else {
                // Show a pop-up or alert when the response status is not "success"
                alert("Email not found. Please try again."); // You can customize this alert message
            }
          
            
        },
    });
});



jQuery("#verify_otp").click(function() {
    let otp = jQuery('#otp').val();
    let id=jQuery('#id').val();

    jQuery.ajax({
        type: "POST",
        url: "/backend/yoc/verification.php",
        data: { verify_otp: true ,
            otp: otp,
            id:id,
        },
         dataType: "json",
        success: function(response) {
         //console.log(response);
            if (response.status === "success") {
                // Redirect to the password reset page with user ID and email as query parameters
                let resetUrl = "/backend/pages/password/reset_password.php?reset=" + response.userId;
                window.location = resetUrl;
            }
           else {
                // Show a pop-up or alert when the response status is not "success"
                alert(response.message); // You can customize this alert message
            }
            
            
        },
    });
});

jQuery("#new_password").click(function() {
    let password = jQuery('#password').val();
    let id=jQuery('#id').val();

    jQuery.ajax({
        type: "POST",
        url: "/backend/yoc/verification.php",
        data: { new_password: true ,
            password: password,
            id:id,
        },
        success: function(response) {
        //  console.log(response);
         if(response.indexOf("password updated") >= 0) {
                callPopup(response);
                 window.location = "/backend/index.php";
                 
            }
           
        },
    });
});


// -------Forget Password End    --------




// -------Donation Report Data    --------
    $('#report_form').submit((e) => {
        e.preventDefault();
    });
    
     let startDate;
     let endDate;
     let donationType;
     let status;
     let paymentType;
     let frequency;
     let txtsearch;
     let orderid;
     let currentPage = 1; // Initialize current page to 1
     const rowsPerPage = 50; // Number of rows to display per page
     let loadData = 0;
     let runLoop = true;
    
const fetchingData = (startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid) => {
    
    $.post('/backend/yoc/getReportData.php', {
           GetReport: "getReport",
           loadData: loadData,
            startDate: startDate,
            endDate: endDate,
            donationType: donationType,
            status: status,
            paymentType: paymentType,
            frequency: frequency,
            txtsearch: txtsearch,
            orderid:orderid
        }, (data, status) => {
            try {
                const start = 0;
                const end = rowsPerPage;
                displayData(data, start, end);
        } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
               }
        });
        
    
};
const fetchingRows = (startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid) => {
    
    $.post('/backend/yoc/getReportData.php', {
           GetReport: "getReport",
            startDate: startDate,
            endDate: endDate,
            donationType: donationType,
            status: status,
            paymentType: paymentType,
            frequency: frequency,
            txtsearch: txtsearch,
            orderid:orderid
        }, (data, status) => {
            try {
                // console.log(data);
                updatePagination(data);
                $(".modaldx").css('display', 'none');
            } catch (e) {
                    $(".modaldx").css('display', 'none');
                    $('#dataCounter p').html(`Filterd Value: 0`);
                }
        });
        
    fetchingData (startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid);
};    

// Function to display data for the current page
function displayData(data, start, end) {
    
    $('#datatables tbody').empty();
 
    for (let i = start; i < end; i++) {
    const items = data[i];
    try{
        const newData = `
            <tr>
               <td>${i+1}</td>
                <td>${items['date']}</td>
                <td>${items['firstname']} ${items['lastname']}</td>
                <td>${items['email']}</td>
                <td>${items['totalamount']}</td>
                <td>${items['status']}</td>
             <td><a href="/backend/pages/donation/DonationDetail.php?reference=${items['TID']}" class="btn btn-gradient-success waves-effect waves-light" style='background: linear-gradient(14deg, #1761fd 0%, rgba(23,97,253,0.6)); box-shadow: 3px 3px 20px 0 rgba(23,97,253,0.4);
    border-radius: 4px;' target="_blank">Detail</a></td>?>`;
            $('#datatables tbody').append(newData);
        }catch(e){
            
        }
    }
    
}

// Function to update the pagination controls
function updatePagination(data) {
    
    const totalPages = Math.ceil(data / rowsPerPage);
    $('#dataCounter p').html(`Filterd Value: ${data}`);
    $('#pagination').html(`
        <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Next</button>
    `);

    // Event handler for "Previous" button
    $('#prevPage').click(() => {
        if (currentPage > 1) {
            currentPage--;
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
             if(loadData > 0){
                 loadData -= 50;
             }
            fetchingData(startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid);
            updatePagination(data);
        }
    });

    // Event handler for "Next" button
    $('#nextPage').click(() => {
        if (currentPage < totalPages) {
            currentPage++;
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
            loadData += 50;
            fetchingData(startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid);
            updatePagination(data);
        }
    });
}

$('#DonationGetReport').click(() => {
    
    currentPage = 1;
    loadData = 0;
    // runLoop = true;
    Donation_btn = false;  
    $(".modaldx").css('display', 'block');
    startDate = $('#fromDate').val();
    endDate = $('#toDate').val();
    donationType = $('#appealdd').val();
    status = $('#status').val();
    paymentType = $('#paymenttype').val();
    frequency = $('#frequency').val();
    txtsearch = $('#txtsearch').val();
    orderid = $('#orderid').val();
   fetchingRows(startDate,endDate,donationType, status, paymentType, frequency, txtsearch,orderid);
        
});
        
//   Custom Code End For Getting Data Demo
        
// Custom Code Start to make Csv Detail Report Data
      
$("#btnexport_summary").click(function() {
     $(".modaldx").css('display', 'block');
    event.preventDefault();
    let startDate2 = $('#fromDate').val();
    let endDate2 = $('#toDate').val();
    let donationType2 = $('#appealdd').val();
    let status2 = $('#status').val();
    let paymentType2 = $('#paymenttype').val();
    let frequency2 = $('#frequency').val();
    let txtsearch2 = $('#txtsearch').val();
    let orderid = $('#orderid').val();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { btnexport_summary: true ,
            startDate: startDate2,
            endDate: endDate2,
            donationType: donationType2,
            status: status2,
            paymentType: paymentType2,
            frequency: frequency2,
            txtsearch: txtsearch2,
            orderid:orderid
            
        },
        success: function(response) {
           
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
             link.download = "AfghanRelief_ExportSummary_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

           $(".modaldx").css('display', 'none');
        },
    });
});


$("#btnexport").click(function() {
    $(".modaldx").css('display', 'block');
    event.preventDefault();
    
    const startDate = $('#fromDate').val();
    const endDate = $('#toDate').val();
    const donationType = $('#appealdd').val();
    const status = $('#status').val();
    const paymentType = $('#paymenttype').val();
    const frequency = $('#frequency').val();
    const txtsearch = $('#txtsearch').val();
     const orderid = $('#orderid').val();
    
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { btnexport: true ,
            startDate: startDate,
            endDate: endDate,
            donationType: donationType,
            status: status,
            paymentType: paymentType,
            frequency: frequency,
            txtsearch: txtsearch,
            orderid:orderid
        },
        success: function(response) {
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "AfghanRelief_ExportDetail_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

          $(".modaldx").css('display', 'none');
        },
    });
});

// ------------Schedules Report------------

let S_Status, S_search, S_donation, S_startDate, S_endDate;

$('#btnLimit').click((e) => {
    e.preventDefault();
    loadDataSchedule = 0;
    currentPageSchedule = 1;
    S_Status = $('#ddlstatus').val();
    S_search = $('#txtsearch').val();
    S_donation = $('#ddlDonation').val();
    S_startDate = $("#fromDate").val();
    S_endDate = $("#toDate").val();
        
    $(".modaldx").css('display', 'block');
    const GetDiv = document.getElementById("pagination");
    if(GetDiv === null){
        $('#data').append('<div id="pagination"></div>');
    }
    fetchingRowsSchedule(S_Status, S_search,S_donation, S_startDate, S_endDate);
})
   
let currentPageSchedule = 1; // Initialize current page to 1
const rowsPerPageSchedule = 50; // Number of rows to display per page
let loadDataSchedule = 0;
    
const fetchingDataSchedule = (S_Status, S_search,S_donation, S_startDate, S_endDate) => {
    
    $.post('/backend/yoc/getReportData.php', {
           ScheduleReport: "ScheduleReport",
           status: S_Status,
           search: S_search,
           startDate: S_startDate,
           endDate: S_endDate,
           donation: S_donation,
           loadDataSchedule: loadDataSchedule
        }, (data, status) => {
            // console.log(data);
            try {
                const start = 0;
                const end = rowsPerPage;
                displayDataSchedule(data, start, end);
                
            } catch (e) {
                $(".modaldx").css('display', 'none');
                $('#dataCounter p').html(`Filterd Value: 0`);
                // console.log(`Error: ${e}`);
            }
        });
        
    
};
const fetchingRowsSchedule = (S_Status, S_search,S_donation, S_startDate, S_endDate) => {
    
    $.post('/backend/yoc/getReportData.php', {
           ScheduleReport: "ScheduleReport",
           status: S_Status,
           search: S_search,
           startDate: S_startDate,
           endDate: S_endDate,
           donation: S_donation
        }, (data, status) => {
            // console.log(data);
            try {
                updatePaginationSchedule(data);
                $(".modaldx").css('display', 'none');
            } catch (e) {
                $(".modaldx").css('display', 'none');
                $('#dataCounter p').html(`Filterd Value: 0`);
                // console.log(`Error: ${e}`);
            }
        });
        
    fetchingDataSchedule (S_Status, S_search,S_donation, S_startDate, S_endDate);
};    

// Function to display data for the current page of Schedule report
function displayDataSchedule(data, start, end) {

// console.log(data);

 $('#datatable tbody').empty();
 for (let i = start; i < end; i++) {
        const items = data[i];
        try{
            const newData = `
            <tr>
                <td>${i+1}</td>
                <td>${items['name']}</td>
                <td>${items['startdate']}</td>
                <td>${items['firstname']}</td>
                <td>${items['email']}</td>
                <td>${items['amount']}</td>
                <td>${items['frequency']}</td>
                <td>${items['status']}</td>
          <td><a href="/backend/pages/schedules/ScheduleDetail.php?reference=${items['sch_id']}" class="btn btn-gradient-success waves-effect waves-light" style='background: linear-gradient(14deg, #1761fd 0%, rgba(23,97,253,0.6)); box-shadow: 3px 3px 20px 0 rgba(23,97,253,0.4);
    border-radius: 4px;' target="_blank">Detail</a></td>?>
         
            </tr>`;
            $('#datatable tbody').append(newData);
        }catch(e){
            // console.log(`Error: ${e}`);
        }
    }
}



$.ajax({
        url: '/backend/yoc/getip.php',
        method: 'GET',
        success: function(response) {
            var tbody = '';
            $.each(response, function(index, data) {
                tbody += '<tr>';
                tbody += '<td>' + data.sno + '</td>';
                tbody += '<td>' + data.ipv4 + '</td>';
                tbody += '<td>' + data.ipv6 + '</td>';
                tbody += '</tr>';
            });
            $('#datatable tbody').html(tbody);
        },
        error: function(error) {
            console.log('Error:', error);
        }
    });

// Function to update the pagination controls of Schedule Report
function updatePaginationSchedule(data) {
    
    const totalPages = Math.ceil(data / rowsPerPage);
    $("#dataCounter p").html(`Filtered Value: ${data}`);
    $('#pagination').html(`
        <button id="prevPage" ${currentPageSchedule === 1 ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Previous</button>
        <span>Page ${currentPageSchedule} of ${totalPages}</span>
        <button id="nextPage" ${currentPageSchedule === totalPages ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Next</button>
    `);

    // Event handler for "Previous" button
    $('#prevPage').click(() => {
        if (currentPageSchedule > 1) {
            currentPageSchedule--;
            const start = (currentPageSchedule - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
             if(loadDataSchedule > 0){
                 loadDataSchedule -= 50;
             }
            fetchingDataSchedule(S_Status, S_search,S_donation, S_startDate, S_endDate);
            updatePaginationSchedule(data);
        }
    });

    // Event handler for "Next" button
    $('#nextPage').click(() => {
        if (currentPageSchedule < totalPages) {
            currentPageSchedule++;
            const start = (currentPageSchedule - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
            loadDataSchedule += 50;
            fetchingDataSchedule(S_Status, S_search,S_donation, S_startDate, S_endDate);
            updatePaginationSchedule(data);
        }
    });
}



 $("#btnscheduleexport").click(function() {
    $(".modaldx").css('display', 'block');
    event.preventDefault();
    const S_Status = $('#ddlstatus').val();
    const S_search = $('#txtsearch').val();
    const S_donation = $('#ddlDonation').val();
    const S_startDate = $("#fromDate").val();
    const S_endDate = $("#toDate").val();

    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { export_schedule: true ,
           status: S_Status,
           search: S_search,
           donation: S_donation,
           startDate: S_startDate,
           endDate: S_endDate
        },
        success: function(response) {
         if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "AfghanRelief_ScheduleReport_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }

           $(".modaldx").css('display', 'none');
        },
    });
});

// ------------G4 data Start------------
let  searchipn;
let g4_startDate;
let g4_endDate;
$('#searchG4').click((e) => {
    e.preventDefault();
    loadDataipn = 0;
    currentPageipn = 1;
    searchipn = $('#txtsearch').val();
    g4_startDate = $('#fromDate').val();
    g4_endDate = $('#toDate').val();
    $(".modaldx").css('display', 'block');
    const GetDiv = document.getElementById("pagination");
    if(GetDiv === null){
        $('#data').append('<div id="pagination"></div>');
    }
    fetchingRowsipn(g4_startDate,g4_endDate,searchipn);
})
let currentPageipn = 1; // Initialize current page to 1
const rowsPerPageipn = 50; // Number of rows to display per page
let loadDataipn = 0;
const fetchingDataipn = (g4_startDate,g4_endDate,searchipn) => {
    
    $.post('/backend/yoc/getReportData.php', {
           ipndata: "ipndata",
          
           searchipn: searchipn,
            g4_startDate: g4_startDate,
            g4_endDate: g4_endDate,
         
           loadDataipn: loadDataipn
        }, (data, searchipn) => {
            //console.log(data);
            try {
                const start = 0;
                const end = rowsPerPage;
                displayDataipn(data, start, end);
                
            } catch (e) {
                $(".modaldx").css('display', 'none');
                $('#dataCounter p').html(`Filterd Value: 0`);
                 //console.log(`Error: ${e}`);
            }
        });
        
    
};
const fetchingRowsipn = (g4_startDate,g4_endDate,searchipn) => {
    
    $.post('/backend/yoc/getReportData.php', {
           ipndata: "ipndata",
           searchipn: searchipn,
            g4_startDate: g4_startDate,
            g4_endDate: g4_endDate,
        }, (data, searchipn) => {
             //console.log(data);
            try {
                updatePaginationipn(data);
                $(".modaldx").css('display', 'none');
            } catch (e) {
                $(".modaldx").css('display', 'none');
                $('#dataCounter p').html(`Filterd Value: 0`);
                // console.log(`Error: ${e}`);
            }
        });
        
    fetchingDataipn(g4_startDate,g4_endDate,searchipn);
};    
function displayDataipn(data, start, end) {

// console.log(data);

 $('#datatable tbody').empty();

 for (let i = start; i < end; i++) {
        const items = data[i];
        try{
            const newData = `
            <tr>
                <td>${i+1}</td>
                 <td>${items['order_id']}</td>
                <td>${items['response']}</td>
            </tr>`;
            $('#datatable tbody').append(newData);
        }catch(e){
            // console.log(`Error: ${e}`);
        }
    }
}
function updatePaginationipn(data) {
    
    const totalPages = Math.ceil(data / rowsPerPage);
      $('#dataCounter p').html(`Filterd Value: ${data}`);
    $('#pagination').html(`
        <button id="prevPage" ${currentPageipn=== 1 ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Previous</button>
        <span>Page ${currentPageipn} of ${totalPages}</span>
        <button id="nextPage" ${currentPageipn === totalPages ? 'disabled' : ''} class='btn btn-gradient-success waves-effect waves-light' style='background: linear-gradient(14deg, #1eca7b 0%, rgba(30,202,123,0.7));
    color: #fff;'>Next</button>
    `);

    // Event handler for "Previous" button
    $('#prevPage').click(() => {
        if (currentPageipn > 1) {
            currentPageipn--;
            const start = (currentPageipn - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
             if(loadDataipn > 0){
                 loadDataipn -= 50;
             }
            fetchingDataipn(g4_startDate,g4_endDate,searchipn);
            updatePaginationipn(data);
        }
    });

    // Event handler for "Next" button
    $('#nextPage').click(() => {
        if (currentPageipn < totalPages) {
            currentPageipn++;
            const start = (currentPageipn - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            // displayData(data, start, end);
            loadDataipn += 50;
            fetchingDataipn(g4_startDate,g4_endDate,searchipn);
            updatePaginationipn(data);
        }
    });
}

$("#G4export").click(function() {
     $(".modaldx").css('display', 'block');
    event.preventDefault();
    let g4_orderid = $('#txtsearch').val();
    let g4_startdate = $('#fromDate').val();
     let g4_enddate = $('#toDate').val();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { g4export: true ,
            g4_orderid:g4_orderid,
            g4_startdate:g4_startdate,
            g4_enddate:g4_enddate
            
        },
        success: function(response) {
            // console.log(response);
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "AfghanRelief_G4Report_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
           $(".modaldx").css('display', 'none');
        },
    });
});

// ------------G4 data End----------



$("#recordappeal").click(function() {
     $(".modaldx").css('display', 'block');
    event.preventDefault();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { 
            recordappeals: true 
            
        },
        success: function(response) {
             
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "Afghanrelief_combination_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
           $(".modaldx").css('display', 'none');
        },
    });
});
$("#missing").click(function() {
     $(".modaldx").css('display', 'block');
    event.preventDefault();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { 
            missing_combinations: true 
            
        },
        success: function(response) {
             
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "afghanRelief_missingcombination_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
           $(".modaldx").css('display', 'none');
        },
    });
});

$("#muharramreport").click(function() {
     $(".modaldx").css('display', 'block');
    event.preventDefault();
    let orderid = $('#txtsearch').val();
     let email  = $('#email').val();
    $.ajax({
        type: "POST",
        url: "/backend/yoc/getReportData.php",
        data: { muharram: true ,
            orderid:orderid,
            email:email
        },
        success: function(response) {
          if (response) {
            var blob = new Blob([response]);
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
           link.download = "AfghanRelief_Muharram_" + dateString + ".csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("No Data Found");
        }
           $(".modaldx").css('display', 'none');
        },
    });
});



// ---------------------------------------------------------------------------------------------------------------------   
   
//   Custom Code end to print detail Report Data
   
    //auth
    jQuery("#login-form-button").click(function(){

        var myForm = document.getElementById('auth-form');
        var isvalidate = true;
        
        for (var i = 0; i < myForm.elements.length; i++) {
        
            if (myForm.elements[i].name == "username") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User name and Password are mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "userpassword") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User name and Password are mandatory fields.");
                    return;
                }
            }
        }
        if (isvalidate) {  
           var username = jQuery("#username").val();
           var password = jQuery("#userpassword").val();
           
            jQuery.ajax({
              type:'post',
              url:'/backend/yoc/auth.php',
              data:{
               action:'Login',
               username_val:username,
               password_val:password,
              },
              success:function(response) {
                if(response.indexOf("id and password matched.")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  })
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Signed in successfully'
                  })
                  
                  window.location = "/backend/pages/dashboard.php";
                }
                else{
                    ShowValidate("Wrong User id or Password.");
                }
                
              }
            });
        }
    });
    //auth
    
    //causes
    jQuery(".change_status").click(function(){
        var appeal_id=jQuery(this).attr('key');
        var res;
        if(jQuery(this).is(":checked")){
            res=cause_status('appeal',appeal_id,0,'status');
            if(res=="yes"){
                jQuery("#status_label_"+appeal_id).text('Enabled');
            }
        }else{
            res=cause_status('appeal',appeal_id,1,'status');
            if(res=="yes"){
                jQuery("#status_label_"+appeal_id).text('Disable');
            }
        }
    });
    
    jQuery(".change_home_status").click(function(){
        var appeal_id=jQuery(this).attr('key');
        var res;
        if(jQuery(this).is(":checked")){
            res=cause_status('appeal',appeal_id,1,'home');
            if(res=="yes"){
                jQuery("#home_label_"+appeal_id).text('Yes');
            }
        }else{
            res=cause_status('appeal',appeal_id,0,'home');
            if(res=="yes"){
                jQuery("#home_label_"+appeal_id).text('No');
            }
        }
    });
    
    jQuery(".change_donate_status").click(function(){
        var appeal_id=jQuery(this).attr('key');
        var res;
        if(jQuery(this).is(":checked")){
            res=cause_status('appeal',appeal_id,1,'donate');
            if(res=="yes"){
                jQuery("#donate_label_"+appeal_id).text('Yes');
            }
        }else{
            res=cause_status('appeal',appeal_id,0,'donate');
            if(res=="yes"){
                jQuery("#donate_label_"+appeal_id).text('No');
            }
        }
    });
        jQuery(".change_feature_status").click(function(){
        var amount_id=jQuery(this).attr('key');
        var res;
        if(jQuery(this).is(":checked")){
            res=cause_status('amount',amount_id,1,'feature');
            if(res=="yes"){
                jQuery("#feature_label_"+amount_id).text('Enable');
            }
        }else{
            res=cause_status('amount',amount_id,0,'feature');
            if(res=="yes"){
                jQuery("#feature_label_"+amount_id).text('Disable');
            }
        }
    });
    
    jQuery(document).on('blur','.appeal_sorting',function(){
        var id=jQuery(this).attr('key');
        var column_name="sort";
        var value=jQuery(this).html();
        update_sort(id,column_name,value);
    })
    //causes
    
    //CRM
    jQuery('.crmRelationId').change(function(){
       var ids=jQuery(this).attr("id");
       var idsarray=ids.split("_", 4);
       var app_id=idsarray[1];
       var amount_id=idsarray[2];
       var fund_id=idsarray[3];
       var crm_id=jQuery(this).val();
       jQuery.ajax({
            url: '/backend/yoc/crm.php',
            data: `action=update&app_id=${app_id}&amount_id=${amount_id}&fund_id=${fund_id}&crm_id=${crm_id}`,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Sales Force Id Updated!'
                  });
                  
                }
                else if(response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Sales Force Id Inserted!'
                  });
                  
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    });
    
    //user
    jQuery(".Add-user-button").click(function(){

        var myForm = document.getElementById('user-form');
        var isvalidate = true;
        
        for (var i = 0; i < myForm.elements.length; i++) {

            if (myForm.elements[i].name == "username") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User name is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "userpassword") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User password is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "display_name") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Display name is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "useremail") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User email is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "user_role") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User role is mandatory fields.");
                    return;
                }
            }
        }
        if (isvalidate) {  
           var username     = jQuery("#username").val();
           var display_name = jQuery("#display_name").val();
           var useremail    = jQuery("#useremail").val();
           var password     = jQuery("#userpassword").val();
           var user_role    = jQuery("#user_role").val();
           
            jQuery.ajax({
                type:'post',
                url: '/backend/yoc/user.php',
                data:{
                    action:'add-new-user',
                    username_val : username,
                    display_name_val : display_name,
                    email_val    : useremail,
                    password_val : password,
                    userrole_val : user_role,
                },
                success:function(response) {
                    if(response.indexOf("user created")>=0){
                        callPopup(response);
                        window.location = "/backend/pages/users/user-list.php";
                    }
                    else if(response.indexOf("user exist")>=0){
                        ShowValidate(response);
                    }
                    else{
                        ShowValidate("Error : while creating new user.");
                    }
                }
            });
        }
    });
    // ------------capi data Start------------
$("#capi_export").click(function() {
    $(".modaldx").css('display', 'block');
   event.preventDefault();
   let capi_orderid = $('#capitxtsearch').val();
   let capi_startdate = $('#capifromDate').val();
    let capi_enddate = $('#capitoDate').val();
   $.ajax({
       type: "POST",
       url: "/backend/yoc/getReportData.php",
       data: { capi_export: true ,
           capi_orderid:capi_orderid,
           capi_startdate:capi_startdate,
           capi_enddate:capi_enddate
           
       },
       success: function(response) {
           // console.log(response);
         if (response) {
           var blob = new Blob([response]);
           var link = document.createElement('a');
           link.href = window.URL.createObjectURL(blob);
          link.download = "OINUSA_Capi_Report_" + dateString + ".csv";
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
       } else {
           alert("No Data Found");
       }
          $(".modaldx").css('display', 'none');
       },
   });
});

// ------------Capi Reponse End----------
    jQuery(".Update-user-button").click(function(){
        
        var myForm = document.getElementById('user-form');
        var isvalidate = true;
        
        for (var i = 0; i < myForm.elements.length; i++) {

            if (myForm.elements[i].name == "username") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User name is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "display_name") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Display name is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "useremail") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User email is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "user_role") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("User role is mandatory fields.");
                    return;
                }
            }
        }
        
        if (isvalidate) {  
           var user_id     = jQuery("#user_id").val();
           var username     = jQuery("#username").val();
           var display_name = jQuery("#display_name").val();
           var useremail    = jQuery("#useremail").val();
           var password     = jQuery("#userpassword").val();
           var user_role    = jQuery("#user_role").val();
           
            jQuery.ajax({
                type:'post',
                url: '/backend/yoc/user.php',
                data:{
                    action:'update-user',
                    user_id : user_id,
                    username_val : username,
                    display_name_val : display_name,
                    email_val    : useremail,
                    password_val : password,
                    userrole_val : user_role,
                },
                success:function(response) {
                    if(response.indexOf("user updated")>=0){
                        callPopup(response);
                        window.location = "/backend/pages/users/user-list.php";
                    }
                    else{
                        ShowValidate("Error : while updating user.");
                    }
                }
            });
        }
    });
    
    jQuery(".change_user_status").click(function(){
        var user_id=jQuery(this).attr('key');
        var status;
        
        if(jQuery(this).is(":checked")){
            status=0;
        }
        else {
            status=1;
        }
        
        jQuery.ajax({
            type:'post',
            url: '/backend/yoc/user.php',
            data:{
                action:'change-user-status',
                user_id:user_id,
                status:status,
            },
            success:function(response) {
                if(response.indexOf("user updated")>=0){
                    if(status==0) {
                        jQuery("#user_label_"+user_id).text('Enabled');
                        jQuery("#user_edit_btn_"+user_id).removeAttr('disabled');
                    }
                    else {
                        jQuery("#user_label_"+user_id).text('Disable');
                        jQuery("#user_edit_btn_"+user_id).attr("disabled", true);
                    }
                    callPopup(response);
                }
                else{
                    ShowValidate("Error: while updating user status");
                }
            }
        });
    });
    
    // donor
    jQuery(".update-donor-button").click(function(){
        
        var myForm = document.getElementById('donor-form');
        var isvalidate = true;
        
        for (var i = 0; i < myForm.elements.length; i++) {

            if (myForm.elements[i].name == "street") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Street is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "city") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("City is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "state") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("State is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "postcode") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Postcode / Zip is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "country") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Country is mandatory fields.");
                    return;
                }
            }
            if (myForm.elements[i].name == "phone") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Phone is mandatory fields.");
                    return;
                }
            }
        }
        
        if (isvalidate) {  
           var donor_id     = jQuery("#donor_id").val();
           var organization = jQuery("#organization").val();
           var street       = jQuery("#street").val();
           var city         = jQuery("#city").val();
           var state        = jQuery("#state").val();
           var postcode     = jQuery("#postcode").val();
           var country      = jQuery("#country").val();
           var phone        = jQuery("#phone").val();
           
            jQuery.ajax({
                type:'post',
                url: '/backend/yoc/donor.php',
                data:{
                    action:'update-donor',
                    donor_id:donor_id,
                    organization:organization,
                    street:street,
                    city:city,
                    state:state,
                    postcode:postcode,
                    country:country,
                    phone:phone,
                },
                success:function(response) {
                    if(response.indexOf("donor updated")>=0){
                        callPopup(response);
                        window.location = "/backend/pages/donor/donors-list.php";
                    }
                    else{
                        ShowValidate("Error : while updating donor.");
                    }
                }
            });
        }
    });
    
    //DM Service
     jQuery(".add-service-button").click(function(){

        var myForm = document.getElementById('service-form');
        var isvalidate = true;
        
        for (var i = 0; i < myForm.elements.length; i++) {

            if (myForm.elements[i].name == "servicename") {
                if (myForm.elements[i].value.length <=0) {
                    isvalidate = false;
                    ShowValidate("Service name is mandatory fields.");
                    return;
                }
            }
        }
        if (isvalidate) {
            var fd = new FormData(myForm);
            fd.append('action', 'add-new-service');
            jQuery.ajax({
                type:'post',
                url: '/backend/yoc/dm.php',
                data: fd,
                processData: false,
                contentType: false,
                success:function(response) {
                   // console.log(response);
                    if(response.indexOf("service created successfully")>=0){
                        callPopup(response);
                        window.location = "/backend/pages/dm/service.php";
                    }
                    else{
                        ShowValidate("Error : while creating Service.");
                    }
                }
            });
        }
    });
    
    jQuery(".update-service-button").click(function(){
        
        var myForm = document.getElementById('service-form');
        var isvalidate = true;
        
        if (isvalidate) {  
            var fd = new FormData(myForm);
            fd.append('action', 'update-service');
            jQuery.ajax({
                type:'post',
                url: '/backend/yoc/dm.php',
                data: fd,
                processData: false,
                contentType: false,
                success:function(response) {
                    console.log(response);
                    if(response.indexOf("service updated successfully")>=0){
                        callPopup(response);
                        window.location = "/backend/pages/users/user-list.php";
                    }
                    else{
                        ShowValidate("Error : while updating Service.");
                    }
                }
            });
        }
    });
    
    jQuery(".change_service_status").click(function(){
        var service_id=jQuery(this).attr('key');
        var status;
        
        if(jQuery(this).is(":checked")){
            status=1;
        }
        else {
            status=0;
        }
        
        jQuery.ajax({
            type:'post',
            url: '/backend/yoc/dm.php',
            data:{
                action:'change-service-status',
                service_id:service_id,
                status:status,
            },
            success:function(response) {
                if(response.indexOf("service updated successfully")>=0){
                    if(status==1) {
                        jQuery("#status_label_"+service_id).text('Enabled');
                    }
                    else {
                        jQuery("#status_label_"+service_id).text('Disable');
                    }
                    callPopup(response);
                }
                else{
                    ShowValidate("Error: while updating service status");
                }
            }
        });
    });
});



jQuery('#donor_btn').click(() => {
    const email = jQuery('#donor_email').val();
    const tid = jQuery('#did').val();

    jQuery.ajax({
        type: "GET",
        url: `/backend/mail/makePDF.php?email=${email}&tid=${tid}`,
        success: function(response) {
            alert(response);
        },
        error: function(xhr, status, error) {
            // Error message display karna agar request fail hoti hai
            alert("An error occurred: " + error);
        }
    });
});
    
      $('#refundButton').click(() => {
        setMyRefund();
    });

    function setMyRefund(){
    var r = confirm("Are you sure you want to refund!!");
    if (r == true) {
    
    var newamount = document.getElementById('newamount').value;
    var order_number  = document.getElementById('order_number').value;
    var reference_number  = document.getElementById('reference_number').value;
    var tid = document.getElementById('tid').value;
    var totalamount =document.getElementById('totalamount').value;
    var refundreason =document.getElementById('refundreason').value;
    var DID =document.getElementById('DID').value;

    if(newamount>totalamount){
        ShowValidate("Amount Can not be greater than total transaction amount.");
        return false;
    }
   jQuery.ajax({
    type: 'post',
    url: '/backend/yoc/getReportData.php',
    data: {
        makestriperefund:true,
        newamount:newamount,
        order_number: order_number,
        reference_number: reference_number,
        tid: tid,
        totalamount:totalamount,
        refundreason:refundreason,
        DID:DID
    },
      
        success:function(response) {
        if(response.indexOf('refundsucceeded') >= 0){
            callPopup('The Refund has been processed');
             $('#RefundModal').modal('hide');
             location.reload();
        }else{
            ShowValidate('The Refund has been Failed');
        }
        }
       });
           
    }
    
} 
       
       
$("#seasonID").change(function () {
    var selectedValue = $(this).val(); 

    if (selectedValue !== "0") {
        var parts = selectedValue.split(" key="); 
        
        if (parts.length === 2) {
            var startDate = parts[1].trim(); 
            var endDate = parts[0].trim(); 

            $("#fromDate").val(startDate).trigger("change");
            $("#toDate").val(endDate).trigger("change");
        }
   
        var appealIDs = ["17", "21", "10","20","16","2","4","14","13"]; 

        // **Set selected values in the dropdown**
        $("#appealdd").val(appealIDs).trigger("change"); 
    } else {
        $("#fromDate").val("").trigger("change");
        $("#toDate").val("").trigger("change");

        // **Clear the selected appeals**
        $("#appealdd").val([]).trigger("change");
    }
});


// Auto-trigger change event on page load if a season is pre-selected
if ($("#seasonID").val() !== "0") {
    $("#seasonID").trigger("change");
}
       
       



function update_sort(id,column_name,value){
    jQuery.ajax({
      type:'post',
      url:'/backend/yoc/cause.php',
      data:{
        action:'update_sort',
       id:id,
       column_name:column_name,
       value:value
      },
      success:function(response) {
       // console.log(response);
      }
    });
}

function Add_amount_Record(){
    var hidval = document.getElementById('amounts_count').value;
    var count = parseInt(hidval) + 1;
    document.getElementById('amounts_count').value = count;
    var d1 = document.getElementById('amountlist_div');
    
    var html='<div class="row amountlist" id="amountlist_'+count+'">';
    html+='<div class="col-md-3">';
    html+='<input type="text" class="form-control" name="amount_name_'+count+'" placeholder="Donation Name" value="">';
    html+='</div>';
    html+='<div class="col-md-1 px-1">';
    html+='<input type="number" class="form-control" name="amount_amount_'+count+'" placeholder="Amount" value="">';
    html+='</div>';
    html+='<div class="col-md-1 px-1">';
    html+='<input type="number" class="form-control" name="amount_sort_'+count+'" placeholder="Sort" value="">';
    html+='</div>';
    html+='<div class="col-md-2">';
    html+='<select class="form-control" name="amount_donation_type_'+count+'">';
    html+='<option value="">Donation Type</option>';
    html+='<option value="MONTHLY">Monthly</option>';
    html+='<option value="YEARLY">Yearly</option>';
    html+='<option value="DAILY">Daily</option>';
    html+='</select>';
    html+='</div>';
     html+='<div class="col-md-2">';
    html+='<select class="form-control" name="amount_featured_'+count+'">';
    html+='<option value="0">Disable</option>';
    html+='<option value="1">Enable</option>';
    html+='</select>';
    html+='</div>';
    html+='<div class="col-md-2">';
    html+='<select class="form-control" name="amount_enable_'+count+'">';
    html+='<option value="0">Enable</option>';
    html+='<option value="1">Disable</option>';
    html+='</select>';
    html+='</div>';
    html+='<div class="col-md-1 soh-padding-right">';
    html+='<button type="button" class="btn btn-gradient-primary waves-effect waves-light" onclick="Add_amount_Record()" id="amount_add_'+count+'">+</button>';
    html+='<button type="button" class="btn btn-gradient-danger waves-effect waves-light" onclick="Rem_amount_Record(this.id)" id="amount_remove_'+count+'">-</button>';
    html+='</div>';
    html+='</div>';
    
    d1.insertAdjacentHTML('beforeend',html);
}

function Rem_amount_Record(id){
    ids=id.split("_");
    var myid = ids[2];
    var elem = document.getElementById("amountlist_"+myid);
    elem.remove();
    var countAll = document.querySelectorAll('.amountlist').length;
    if(countAll<=0){
        Add_amount_Record();
    }
}

function Add_fund_Record(){
    var hidval = document.getElementById('funds_count').value;
    var count = parseInt(hidval) + 1;
    document.getElementById('funds_count').value = count;
    var d1 = document.getElementById('fundlist_div');
    
    var html='<div class="row fundlist" id="fundlist_'+count+'">';
    html+='<div class="col-md-5">';
    html+='<input type="text" class="form-control" name="fund_name_'+count+'" placeholder="Fund Name" value="">';
    html+='</div>';

    html+='<div class="col-md-2">';
    html+='<input type="number" class="form-control" name="fund_sort_'+count+'" placeholder="Sort" value="0">';
    html+='</div>';
    
    html+='<div class="col-md-2">';
    html+='<select class="form-control" name="fund_enable_'+count+'">';
    html+='<option value="0">Enable</option>';
    html+='<option value="1">Disable</option>';
    html+='</select>';
    html+='</div>';
    
    html+='<div class="col-md-3 soh-padding-right">';
    html+='<button type="button" class="btn btn-gradient-primary waves-effect waves-light" onclick="Add_fund_Record()" id="fund_add_'+count+'">+</button>';
    html+='<button type="button" class="btn btn-gradient-danger waves-effect waves-light" onclick="Rem_fund_Record(this.id)" id="fund_remove_'+count+'">-</button>';
    html+='</div>';
    html+='</div>';
    
    d1.insertAdjacentHTML('beforeend',html);
}

function Rem_fund_Record(id){
    ids=id.split("_");
    var myid = ids[2];
    var elem = document.getElementById("fundlist_"+myid);
    elem.remove();
    var countAll = document.querySelectorAll('.fundlist').length;
    if(countAll<=0){
        Add_fund_Record();
    }
}

function logout(message){
    jQuery.ajax({
              type:'post',
              url:'/backend/yoc/auth.php',
              data:{
               action:'Logout',
              },
              success:function(response) {
                window.location = "/backend/";
              }
            });
}

function cause_status(place,id,value,field){
    var res='yes';
    jQuery.ajax({
              type:'post',
              url:'/backend/yoc/logics.php',
              data:{
               action:'Appeal_status',
               place:place,
               id:id,
               status:value,
               field:field,
              },
              success:function(response) {
                //   console.log(response);
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Status Updated!'
                  });
                  
                }
                else{
                    res='no';
                    ShowValidate("Somthing Went Wrong");
                }
                
              }
            });
    return res;
}

function ShowValidate(message){
    Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
        });
}

function callPopup(response) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
  
    Toast.fire({
        icon: 'success',
        title: response
    });
}

//causes
function add_appeal(){
    var myForm=document.getElementById('add_appeal_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "appeal_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      if (myForm.elements[i].name == "appeal_image") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Image Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
     
      if (myForm.elements[i].name == "appeal_catagory") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Category Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
       if (myForm.elements[i].name == "appeal_sort") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Sort Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_home") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Home Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
        if (myForm.elements[i].name == "appeal_footer") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Footer Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_donate") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Donate Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_isother") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Custom Amount Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_quantity") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Quantity Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_isrecurring") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Recurring Type Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
       if (myForm.elements[i].name == "appeal_goal") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Goal Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      if (myForm.elements[i].name == "appeal_type") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Type Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'add_appeal');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
               
                if(response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Appeal Inserted'
                  });
                   jQuery(".soh-appeal-tabs").attr("style", "display:block");
                }
                else{
                     console.log(response);
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_appeal(){
    var myForm=document.getElementById('add_appeal_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "appeal_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      if (myForm.elements[i].name == "appeal_image") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Image Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
     
      if (myForm.elements[i].name == "appeal_catagory") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Category Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
       if (myForm.elements[i].name == "appeal_sort") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Sort Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_home") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Home Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
        if (myForm.elements[i].name == "appeal_footer") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Footer Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_donate") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Donate Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_isother") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Custom Amount Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_quantity") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Quantity Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
        if (myForm.elements[i].name == "appeal_isrecurring") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Recurring Type Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      
       if (myForm.elements[i].name == "appeal_goal") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Goal Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
      if (myForm.elements[i].name == "appeal_type") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Appeal Type Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_appeal');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Appeal Updated'
                  });
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_amount(){
    var myForm=document.getElementById('amounts_form');
    var isvalidate = true;
     for (var i = 0; i < myForm.elements.length; i++) {
        var element = myForm.elements[i];
        
        if (element.name.startsWith("amount_name_")) {
            if (element.value.trim().length <= 0) {
                isValid = false;
                ShowValidate("Amount Name is a mandatory field.");
                element.focus();
                return;
            }
        }
         if (element.name.startsWith("amount_amount_")) {
            if (element.value.trim().length <= 0) {
                isValid = false;
                ShowValidate("Amount is a mandatory field.");
                element.focus();
                return;
            }
        }
        
        if (element.name.startsWith("amount_sort_")) {
            if (element.value.trim().length <= 0) {
                isValid = false;
                ShowValidate("Sort is a mandatory field.");
                element.focus();
                return;
            }
        }
      
     }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_amount');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                console.log(response);
                
                if(response.indexOf("Updated")>=0 || response.indexOf("Inserted")>=0 ){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Action Performed'
                  });
                  location.reload();
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_fund(){
    var myForm=document.getElementById('funds_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {
        var element = myForm.elements[i];
        
        if (element.name.startsWith("fund_name_")) {
            if (element.value.trim().length <= 0) {
                isValid = false;
                ShowValidate("Fund Name is a mandatory field.");
                element.focus();
                return;
            }
        }
         if (element.name.startsWith("fund_sort_")) {
            if (element.value.trim().length <= 0) {
                isValid = false;
                ShowValidate("Sort is a mandatory field.");
                element.focus();
                return;
            }
        }
    }
    
    
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_fund');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                //console.log(response);
                
                if(response.indexOf("Updated")>=0 || response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Action Performed'
                  });
                  location.reload();
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function add_season(){
    var myForm=document.getElementById('add_season_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "season_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'add_season');
    
        jQuery.ajax({
            
            url: '/backend/yoc/season.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                console.log(response);
                if(response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Season Inserted'
                  });
                     window.location = "/backend/pages/seasons/seasons.php";
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}
function update_season(){
    var myForm=document.getElementById('add_season_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "season_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_season');
    
        jQuery.ajax({
            
            url: '/backend/yoc/season.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                console.log(response);
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Season Updated'
                  });
                     window.location = "/backend/pages/seasons/seasons.php";
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function add_catagory(){
    var myForm=document.getElementById('add_catagory_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "catagory_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Catagory Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'add_catagory');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Catagory Inserted'
                  });
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_catagory(){
    var myForm=document.getElementById('add_catagory_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "catagory_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Catagory Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_catagory');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Catagory Updated'
                  });
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function add_country(){
    var myForm=document.getElementById('add_country_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "country_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("Country Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'add_country');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Inserted")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Country Inserted'
                  });
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_country(){
    var myForm=document.getElementById('add_country_form');
    var isvalidate = true;
    
    for (var i = 0; i < myForm.elements.length; i++) {

      if (myForm.elements[i].name == "country_name") 
      {
        if (myForm.elements[i].value.length <=0) {
              isvalidate = false;
              ShowValidate("country Name Is Mandatory Field.");
              myForm.elements[i].focus();
              return;
          }
      }
    }
    if (isvalidate) {
        var fd = new FormData(myForm);
        fd.append('action', 'update_country');
    
        jQuery.ajax({
            url: '/backend/yoc/cause.php',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (response) {
                if(response.indexOf("Updated")>=0){
                    const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                      toast.addEventListener('mouseenter', Swal.stopTimer);
                      toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                  });
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'Country Updated'
                  });
                }
                else{
                    ShowValidate("Somthing Went Wrong");
                }
            }
        });
    }
}

function update_amount_to_fund() {
    var elems = document.querySelectorAll('.amount_to_fund');
    var selectedFunds = [];
    
    elems.forEach(function(elem) {
        
        // if(elem.value==""){
        //     selectedFunds.push(elem.id);
        // }

        selectedFunds.push(elem.id);

        var selectedOptions = elem.selectedOptions;
        
        for (var i = 0; i < selectedOptions.length; i++) {
            selectedFunds.push(selectedOptions[i].value);
        }
        
        
    });

    
    update_association(selectedFunds);
}

function update_fund_to_amount() {
    var elems = document.querySelectorAll('.fund_to_amount');
    var selectedAmounts = [];
    
    elems.forEach(function(elem) {
        
        // if(elem.value==""){
        //     selectedAmounts.push(elem.id);
        // }
        selectedAmounts.push(elem.id);
        
        var selectedOptions = elem.selectedOptions;
        
        for (var i = 0; i < selectedOptions.length; i++) {
            selectedAmounts.push(selectedOptions[i].value);
        }
    });
    
    update_association(selectedAmounts);
}

function update_association(selectedFunds=null) {

    jQuery.ajax({
        type:'post',
        url:'/backend/yoc/cause.php',
        data:{
            action:'update_amount_to_fund',
            fund_ids:selectedFunds,
        },
        success:function(response) {
            if(response.indexOf("updated")>=0){
                const Toast = Swal.mixin({
                toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    onOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
          
                Toast.fire({
                    icon: 'success',
                    title: 'Association updated successfully'
                })
            }
            else{
                ShowValidate("Association not updated.");
            }
            
            location.reload();
        }
    });
}

function cancelschedule(id){
    var r = confirm("Are you sure you want to Cancel!!");
    if (r == true) {
        jQuery.ajax({
    type: 'post',
    url: '/backend/yoc/getReportData.php',
    data: {
        cancelschedule:true,
        sch_id:id
         
        },
      
        success:function(response) {
            console.log(response);
        // if(response.indexOf('cancelled') >= 0){
        //     callPopup('The Schedule has been cancelled!');
        //     location.reload();
        // }else{
        //     ShowValidate('Something went wrong.');
        // }
        }
       });
    }
}

