import {Slide} from "@mui/material";

const Key = ({letter}) => {
    return <div className="key">
        {
            letter.isShown && <Slide direction="down" in={true} appear={true} timeout={1000}>
                <span style={{ verticalAlign: 'center' }}>{letter.letter}</span>
            </Slide>
        }
    </div>;
}

export default Key;