var iframe = null;
let fileId = null;

function changeDivHeight() {
  // Find the div with class 'ic-app-nav-toggle-and-crumbs' and 'no-print'
  var divs = document.querySelectorAll('.ic-app-nav-toggle-and-crumbs.no-print');
  if (divs.length > 0) {
      // Loop through each matching div
      divs.forEach(function(div) {
          // Change the height of each div
          div.remove();
      });
  }
}

// Call the function when the content script is loaded

function accessIframeContent() {
  iframe = document.getElementById('undefined'); // Replace 'pdf-iframe' with the ID of your iframe
  if (iframe) {
    fileId = extractAttachmentIdFromUrl(iframe.src);
      const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
      // Now you can access the content of the iframe and manipulate it as needed
      console.log("Content of the iframe:", iframe);
  } else {
      console.log("Iframe not found.");
  }
}

function extractAttachmentIdFromUrl(url) {
  let idNumber = url.search(/attachment_id/);
  const attachment_id = url.substring(idNumber + 17, idNumber + 26);
  return attachment_id;
}

// Call the function to access iframe content
accessIframeContent();


async function getPDF(api = null) {
  const domain = window.location.origin;
  //let fileID = '239626562'
  console.log("out " + fileId);
  try {
    let PDFInfo = api ? api : await getData(`${domain}/api/v1/files/${fileId}/public_url`);
    if (true) {
      console.log("PDF Public URL:", PDFInfo.public_url);
      return PDFInfo.public_url;
    }
  } catch (error) {
    console.error("PDF retrieval failed:", error);
    return null;
  }
}

async function getData(url) {
  let response = await fetch(url, {
      method: 'GET',
      headers: {
          'Content-Type': 'text/plain',
          'Accept': 'text/plain'
      }
  });
  let data = await response.json();
  return data
}

function injectFontAwesome() {
  var faStylesheet = document.createElement('link');
  faStylesheet.rel = 'stylesheet';
  faStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
  document.head.appendChild(faStylesheet);
}

injectFontAwesome();



async function displayPDF() {
  const pdfUrl = await getPDF();
  if(!pdfUrl) {
    return;
  }
  // Create a div element to contain the PDF viewer
  const pdfContainer = document.createElement('div');
  pdfContainer.className = 'pdf-container';

  // Function to create and append the embed element for the PDF viewer
  const createPDFViewer = () => {
    // Delete previous PDF viewer if it exists
    while (pdfContainer.firstChild) {
      pdfContainer.removeChild(pdfContainer.firstChild);
    }


    // Create an embed element for the PDF viewer
    changeDivHeight();

    const pdfEmbed = document.createElement('embed');
    pdfEmbed.style.border = '2px solid #464f5b';
    pdfEmbed.src = pdfUrl; //https://media.geeksforgeeks.org/wp-content/cdn-uploads/20210101201653/PDF.pdf
    pdfEmbed.type = 'application/pdf';
    pdfEmbed.style.width = '100%';
    const screenHeight = window.innerHeight; // Total height of the screen
    const elementOffsetTop = pdfContainer.offsetTop; // Offset of the element from the top of the screen
    const remainingHeight = screenHeight - elementOffsetTop - 20;
    pdfEmbed.style.height = remainingHeight + 'px'; // Adjust height as needed
    // Append the embed element to the container
    pdfContainer.appendChild(pdfEmbed);

    var button = document.createElement("button");
    button.innerHTML = '<i class="fas fa-external-link-alt"></i>';

    // Styling the button (optional)
    button.style.position = "absolute";
    button.style.top = "20px";
    button.style.right = "20px";
    button.style.zIndex = "9999"; // Ensures it's on top of other elements
    button.style.backgroundColor = 'rgba(50, 54, 57, 1)'; // Change button color
    button.style.color = 'rgba(241, 241, 241, 1)'; // Change text color
    button.style.cursor = 'pointer'; // Change cursor to pointer
    button.style.border = 'none'; // Remove border
    button.style.left = '1373px'; // Offset the button 20 pixels from the left
    //button.style.top = '84px'; // Offset the button 20 pixels from the top
    button.style.width = '5px'; // Change button width
    button.style.height = '5px'; // Change button height

    // Append the button to the body of the webpage
    document.body.appendChild(button);

    // Add event listener for button click
    button.addEventListener("click", function() {
        customPDFToggle = false;
        // Your button click logic here
        console.log("Button clicked!");
        window.open(pdfUrl);
    });
  };

  // Function to reload PDF viewer on window resize
  const reloadPDFViewer = () => {
    createPDFViewer();
  };

  // Call the function initially to create the PDF viewer
  createPDFViewer();

  const targetElement = document.getElementById('doc_preview');

  // Delete the content of the target element if it exists
  if (targetElement) {
    const contentDiv = document.getElementById('content-wrapper');
    targetElement.innerHTML = ''; // Delete the content
    contentDiv.innerHTML = '';
    // Append the container to the target element
    contentDiv.appendChild(pdfContainer);
  } else {
    console.error('Target element not found.');
  }

  // Event listener for window resize
  //window.addEventListener('resize', reloadPDFViewer);
}

displayPDF();