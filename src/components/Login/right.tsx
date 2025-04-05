import { Image } from 'antd';
const bg = require('../../assets/images/bg-login.jpeg');

export default function Right() {
    return (
        <Image
            preview={false}
            width="100%"
            height="100vh"
            src={bg}
            style={{objectFit: "cover"}}
        />
    );
}
