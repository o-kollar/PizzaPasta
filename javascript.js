<!doctype html>
<html>
<head>
  <title>API Test</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <link href="./common.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <iframe  class="position-absolute mt-10 z-1" id="map-iframe" src="https://www.freemap.sk/#map=1/48.687334/19.500732&layers=O&embed=noMapSwitch,noLocateMe" style="width: 100%; height: 500px; border: 0; " allowfullscreen></iframe>
  <div class="w-full mx-auto  position-absolute top-10 z-2">
    <div class="bg-white shadow-md rounded-lg px-3 py-2 mb-4">

        <div class=" w-80 flex items-center bg-gray-200 rounded-md">
            <div class="pl-2">
                <svg class="fill-current text-gray-500 w-6 h-6" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <path class="heroicon-ui"
                        d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                </svg>
            </div>
            <input
                class="w-80 rounded-md bg-gray-200 text-gray-700 leading-tight focus:outline-none py-2 px-2"
                id="locationInput" type="text" placeholder="Search teams or members">
        </div>
        <button id="useLocation" type="button" class="btn btn-light" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom"><span class="material-symbols-outlined">
          share_location
          </span></button>
        <div id="suggestedLocation" class="py-3 text-sm">
          
           
           
        </div>
       
    </div>
</div>
  
      </div>
      </div>

      
<div class="offcanvas offcanvas-bottom big-offcanvas" tabindex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel" data-bs-scroll="true" data-bs-backdrop="false">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="offcanvasBottomLabel">Offcanvas bottom</h5>
    
    <ul id="address-list" class="list-group">
  
    <p id="element-id"></p>
  
</div>
<div class="offcanvas-body small">
  <div class="dropdown">
<input type="text" id="destinationInput" class="form-control dropdown-toggle"  data-bs-toggle="dropdown" aria-expanded="false">
<ul id="suggestedDestination" class="dropdown-menu">
</ul>
<ul class="list-group">

</ul>
</div>

 
 
  

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
<script src="./javascript.js"></script>
<script src="./controller.js"></script>


</body>
</html>

