import React from 'react';
import { Col, Row, Space } from 'antd';
import { Routes, Route } from 'react-router-dom';

import Left from "../../components/Login/left";
import Right from "../../components/Login/right";
import Forgot from '../../components/Login/forgot';
import Reset from '../../components/Login/reset';
import Copyright from '../../components/Commons/Shared/Copyright';
import PageNotFound from '../Errors/PageNotFound';
import Logo from '../../components/Login/Logo';

export default function Login() {
    return (
        <Row align='middle'>
            <Col id="login-left" span={24} lg={{ span: 14 }}>
                <Space
                    direction="vertical"
                    size="small"
                    style={{
                        display: "flex",
                        width: "328px",
                        margin: "auto",
                        padding: "auto",
                    }}
                >
                    <Logo />

                    <Routes>
                        <Route path="/" element={<Left />} />
                        <Route path="/login" element={<Left />} />
                        <Route path="/forgot-password" element={<Forgot />} />
                        <Route path="/reset-password" element={<Reset />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>

                    <Copyright />
                </Space>
            </Col>
            <Col id='login-right' span={0} lg={{ span: 10 }}>
                <Right />
            </Col>
        </Row>
    );
}
