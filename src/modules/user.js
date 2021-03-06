import {io} from 'socket.io-client'

const ENDPOINT = "https://bsingroom.loca.lt";

class User{

    host = false;
    roomInfo;
    mediaStream;
    connection;
    audioRef;

    constructor(userIcon, nickname, ID){
        this.userIcon = userIcon;
        this.nickname = nickname;
        this.ID = ID;
    }
    
    setConnection(me, join){
        console.log('setconnection', this.ID, join)
        this.connection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ]
                }
            ]
        })
        me.localDestination.stream.getTracks().forEach(track =>{
            this.connection.addTrack(track, me.localDestination.stream)
        })
        if(join){
            this.connection.createOffer()
            .then((result)=>{
                this.connection.setLocalDescription(result)
                me.socket.emit("offer", result, this.ID)
            })
        }
        this.connection.addEventListener("icecandidate", (ice)=>{
            console.log(ice)
            me.socket.emit("ice", ice.candidate, this.ID )
        })
        
        this.connection.addEventListener("addstream", (data)=>{
            this.mediaStream = data.stream
            this.audioRef.srcObject = this.mediaStream
            this.audioRef.play();
        })
        
    }

    setOffer(me, offer){
        this.connection.setRemoteDescription(offer);
        this.connection.createAnswer()
        .then((result)=>{
            this.connection.setLocalDescription(result);
            me.socket.emit("answer", result, this.ID);
        })
    }

    setAnswer(answer){
        this.connection.setRemoteDescription(answer);
    }

    setIce(ice){
        this.connection.addIceCandidate(ice);
    }

    setVolume(volume){
        this.audioRef.volume = volume;
    }
}

class Me extends User{

    socket = io.connect(ENDPOINT);
    deviceId = "default";
    localAudioCtx = new AudioContext();
    localGainNode = this.localAudioCtx.createGain();
    localDestination = this.localAudioCtx.createMediaStreamDestination();

    constructor(userIcon, nickname){
        super(userIcon, nickname);
        this.socket.emit("getNickname", this.nickname, this.userIcon)
        this.socket.on('connect', ()=>{this.ID = this.socket.id;})
        this.setMedia();
    }
    
    joinRoom(roomname){
        this.socket.emit('joinRoom',roomname)
        this.roomInfo = roomname;
    }

    async setMedia(deviceID="default"){
        navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: false, deviceId:{exact: deviceID} },
            video: false
        }).then((stream)=>{
            this.localSource = this.localAudioCtx.createMediaStreamSource(stream);
            this.localSource.connect(this.localGainNode);
            this.localGainNode.connect(this.localDestination);
            this.localGainNode.gain.value = 0.5;
        })
        this.deviceId = deviceID ;

    }

    setLocalAudio(ref){
        ref.srcObject = this.localDestination.stream;
        ref.play();
    }

    setLocalVolume(volume){
        this.localGainNode.gain.value = volume;
    }
}

export {User, Me}