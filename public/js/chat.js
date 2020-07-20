const socket=io()

// socket.on("countUpdated",(count)=>{
// 	console.log("the count has been updated",count)
// })

// const x=document.querySelector("#increment").addEventListener("click",()=>{
// 	console.log("clicked")

// 	socket.emit("increment")
// })
var audio=new Audio('./voice/ting.mp3')

// Elements

const $messageForm=document.querySelector("#message-form")
const $messageFormInput=document.querySelector("input")
const $messageFormButton=document.querySelector("button")

const $sendLocationButton=document.querySelector("#send-location")

const $messages=document.querySelector("#messages")
const $location=document.querySelector("#locationMessage")
// Templates

const messageTemplate=document.querySelector("#message-template").innerHTML
const locationmessageTemplate=document.querySelector("#location-message-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

// Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
	// New message element
	const $newMessage=$messages.lastElementChild

	// Height of the New message
	const newMessageStyles=getComputedStyle($newMessage)
	const newMessageMargin=parseInt(newMessageStyles.marginBottom)
	const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

	//Visible height
	const visibleHeight=$messages.offsetHeight

	// height of messages container
	const containerHeight=$messages.scrollHeight

	// How far have i scrolled?
	const scrollOffset=$messages.scrollTop + visibleHeight

	if (containerHeight- newMessageHeight <= scrollOffset){
		$messages.scrollTop=$messages.scrollHeight

	}

}

socket.on("message",(message)=>{
 	console.log(message)
 	const html=Mustache.render(messageTemplate,{
 		username:message.username,
 		message:message.text,
 		createdAt:moment(message.createdAt).format("h:mm a")
 	})
 	audio.play()
 	$messages.insertAdjacentHTML("beforeend",html)
 	autoscroll()
 })

socket.on("locationMessage",(message)=>{
	console.log(message)
	const html=Mustache.render(locationmessageTemplate,{
		username:message.username,
 		url:message.url,
 		createdAt:moment(message.createdAt).format("h:mm a")
 	})

 	$messages.insertAdjacentHTML("beforeend",html)
 	audio.play()
 })	

socket.on("roomData",({room,users})=>{
	const html = Mustache.render(sidebarTemplate,{
		room,
		users
	})
	document.querySelector("#sidebar").innerHTML= html
})
$messageForm.addEventListener("submit",(e)=>{
	e.preventDefault()

	$messageFormButton.setAttribute("disabled","disabled")
	// disable message
	const message=e.target.elements.message.value

	socket.emit("sendMessage",message,(error)=>{
		$messageFormButton.removeAttribute("disabled")
		$messageFormInput.value=''
		$messageFormInput.focus()
		// enable

		if (error){
			return console.log(error)
		}
		console.log("Message Delivered")
	})
})

$sendLocationButton.addEventListener("click",()=>{

	if (!navigator.geolocation){
		return alert("Geolocation is not supported by your system")
	}

	$sendLocationButton.setAttribute("disabled","disabled")
	navigator.geolocation.getCurrentPosition((position)=>{
		
		socket.emit("sendLocation",{
			latitude:position.coords.latitude,
			longitude:position.coords.longitude

		},()=>{
			$sendLocationButton.removeAttribute("disabled")
			console.log("Location Shared")
		})
	})
})

socket.emit("join",{username,room},(error)=>{
	if (error){
		alert(error)
		location.href="/"
	}
})