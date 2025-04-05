import React, { useState } from 'react';
import { Modal, Radio, Space, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ModalCancelEvent({ open, onOk, onCancel }) {
    const [deleteType, setDeleteType] = useState('one');

    return (<Modal
        okText="Sim"
        cancelText="Não"
        onOk={() => onOk(deleteType)}
        onCancel={() => onCancel()}
        open={open}
    >
        <div style={{
            display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0px'
        }}>
            <InfoCircleOutlined style={{ color: '#FAAD14', fontSize: 20 }} />
            <Title style={{ margin: 0 }} level={4}>
                Deseja excluir este evento?
            </Title>
        </div>
        <div>
            <Radio.Group onChange={(value) => setDeleteType(value.target.value)} value={deleteType}>
                <Space direction="vertical">
                    <Radio value={'one'}>Somente este evento</Radio>
                    <Radio value={'all'}>Todos os eventos da série</Radio>
                </Space>
            </Radio.Group>
        </div>
    </Modal>)   
}