import { Drawer, Form, Space, Typography, Upload, Button, message, Switch } from "antd";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { saveProducts } from "../../services/products.service";
const { Text } = Typography;

export default function SidebarProducts({ open, onClose, ids, itemSelected }: any) {
    const [loading, setLoading]: any = useState(false);
    const [isLoading, setIsLoading]: any = useState(false);
    const [fileList, setFileList]: any = useState([]);
    const [initialValues, setInitialValues]: any = useState({})
    const [deleteImage, setDeleteImage] = useState(false)
    const [form] = Form.useForm();

    const { mutate, isSuccess: isSuccessMutation } = useMutation(
        ['mutationProducts'],
        saveProducts
    )

    useEffect(() => {
        if (itemSelected) {
            if (itemSelected.images) {
                setFileList([{
                    status: "done",
                    url: itemSelected.images,
                }])
            }
            if (itemSelected.active) {
                setInitialValues({ ...itemSelected, active: true })
            } else {
                setInitialValues({ ...itemSelected, active: false })
            }
        } else {
            setInitialValues({ active: false })
        }
    }, [itemSelected])

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    useEffect(() => {
        if (isSuccessMutation) {
            message.success('Produto atualizado com sucesso!');
            setIsLoading(false)
            onClose(true);
            setDeleteImage(false);
        }
    }, [isSuccessMutation])

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </div>
    );

    const handleChange = ({ fileList: newFileList }: any) => {
        const filteredFileList = newFileList.filter((file: any) => {
            const allowedExtensions = ['.jpg', '.jpeg', '.png'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (file.size > 3 * 1024 * 1024) {
                message.error(`${file.name} tem mais de 3MB.`);
                return false;
            }

            if (!allowedExtensions.includes(fileExtension)) {
              message.error(`Apenas são permitidos ficheiros do tipo: ${allowedExtensions.join(', ')}`);
              return false;
            }
            return true;
          });

          const removedFiles = fileList.filter((file: any) => !filteredFileList.includes(file));
          if (removedFiles.length > 0) {
            setDeleteImage(true);
          }

        setFileList(filteredFileList);
    };

    const onFinish = (values: any) => {
        setIsLoading(true);
        const image = fileList.length > 0 ? fileList[0].thumbUrl : undefined;
        mutate({ image, ids: ids, ...values, deleteImage: deleteImage });
    };

    const onFinishFailed = () => {
        setIsLoading(false);
        setDeleteImage(false);
        message.error('Erro ao guardar as alterações do produto!');
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            closable={false}
            width={544}
            title={`${ids.length} ${ids.length > 1 ? 'Produtos selecionados' : 'Produto selecionado'}`}
        >
            <div>
                <Form
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={initialValues}
                    layout="vertical">
                    <Form.Item>
                        <Space direction="vertical" style={{ paddingBottom: 16 }}>
                            <Text >Imagem</Text>
                            <Text style={{ color: '#00000073' }}>Formatos: .jpg, .jpeg, .png. Máx. 3Mb</Text>
                        </Space>
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={handleChange}
                        >
                            {fileList.length === 0 && uploadButton}
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="active"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        Guardar
                    </Button>
                </Form>
            </div>
        </Drawer>
    )
}
