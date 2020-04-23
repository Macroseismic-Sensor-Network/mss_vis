


<template>
	<div id="popUp" class="ui-widget-content" style="position:absolute; background-color:white;" v-on:popup="setPopUpData">
		<div style="text-align:right" id="buttonsContainer">
			<button v-on:click="$emit('add-popup')" id="addButton">
				<img id="addIcon" v-bind:src="add_icon_path">
			</button>
			
			<button v-on:click="$emit('close-popup')" id="closeButton">
				<img id="closeIcon" v-bind:src="close_icon_path">
			</button>

		</div>
		<h2  id="content">{{name}}</h2>
		<h3 style="background-color:LightGray"  id="content">Stationsmetadaten</h3>
		<p id="content"><b>ID:</b> {{station_id}}</p>		
		<p id="content"><b>Netzwerk</b> {{network}}</p>
		<p id="content"><b>Standort:</b> {{location}}</p>
		<p id="content"><b>Koordinaten:</b> {{coords}}</p>
		<p id="content"><b>UTM Koordinaten:</b> {{utm_coords}}</p>
		<p id="content"><b>Beschreibung:</b> {{description}}</p>
		
	</div>
</template>


<script>


export default {

	
	name:"PGVPopUp",
	
	props: {
		station_id: String,
		name: String,
		network: String,
		location: String,
		coords: String,
		utm_coords: String,
		description: String,
	},
	
	mounted() {
		
		//Jquery draggable und resizable für das PopUp aktivieren
		// eslint-disable-next-line
		$("#popUp").draggable({
			scroll: false
		});
		if(!this.atttached) {
			// eslint-disable-next-line
			$( "#popUp" ).resizable({
				lsoResize: "#content",
				maxHeight: 600,
				maxWidth: 500,
				minHeight: 480,
				minWidth: 250,
			});
		}
		

		
	},
	
	
	data() {
		return {
			close_icon_path:"/assets/vue/image/icons/close_popup.png",
			attached:false,
		}
	},
	
	computed: {
		add_icon_path: function() {
			if(!this.attached) {
				return "/assets/vue/image/icons/lock_closed.png";
			}
			else {
				return "/assets/vue/image/icons/lock_open.png";
			}
		},
	},
	
	methods: {
		setPopUpData() {
			console.log("SETPOPUPDATA");

		},
	},
	
}
</script>

<style scoped>

	
	#popUp{
		position:relative;
		display:inline-block;
		width:300px;
		height:480px;

			
		margin: 0px auto;
		background-color: #E87B10;
		border-radius: 25px;
	}
	#addPopUp{
		position:absolute;
	}
	#closeButton{
		position:relative;
		right:20px;
	}
	#buttonsContainer {
		width:100%;
		position:absolute;
	}
	#closeIcon{
		width:22px;
		height:22px;
	}
	#addIcon{
		width:22px;
		height:22px;
	}
	#addButton{
		position:relative;
		right:35px;
	}
</style>


<style lang="sass">
$attached:false	

div#popUp
	top: 200px
	padding:0.5em
	border: 2px solid black
	z-index:500


div#addPopUp
	bottom:0
	right:0
	
</style>