import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router";

const { Text } = Typography;

export default function PageNotFound() {
    const navigate = useNavigate();

    return (
        <div className="content_page">
            <Card title="Página não encontrada!" headStyle={{
                color: '#107B99',
                fontWeight: 600
            }}>
                <p>Não foi possível encontrar a página solicitada.</p>
                <p>Verifique a URL e tente novamente.</p>

                <Button onClick={() => navigate('/')}>Ir para o início</Button>
            </Card>
        </div>
    )
}
