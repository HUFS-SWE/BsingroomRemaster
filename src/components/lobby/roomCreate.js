import React,{useState} from "react";
import styled from 'styled-components';
import CustomButton from "../btn";

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%auto;
    border: 1px solid lightgray;
    margin: 20px;
    padding: 20px;
    color: lightgray;
    overflow-y: auto;
    align-items: center;
`
const Label = styled.div`
    flex: 1;
    width: 100%;
    padding-bottom: 20px;
    font-size:20px;
    margin-bottom: 50px;
    border-bottom: solid 1px lightgrey;
`
function RoomCreate({user,navigate}){

    const [inputs, setInputs] = useState({
        roomname: '',
    });
    const { roomname } = inputs;

    const onChange = e => {
        const { name, value } = e.target;
        setInputs({
            ...inputs,
            [name]: value
        });
    };

    const onCreate = () => {        //'방만들기' 클릭 시 실행
        user.host = true;
        user.joinRoom("room_"+roomname)
        navigate('/room',{replace:true})
    };

    return( 
    <Container>
        <Label>Room Create</Label>
        <div style={{flex:"10"}}>
            <input style={{width:"60%", height:"25px",
                        border:"none",  marginRight: '10px', borderRadius:"5px"}}
                name="roomname"
                placeholder="방제"
                onChange={onChange}
                value={roomname}/>
            <CustomButton onClick={onCreate}>방 만들기</CustomButton>
        </div>
    </Container>
    )
}

export default RoomCreate