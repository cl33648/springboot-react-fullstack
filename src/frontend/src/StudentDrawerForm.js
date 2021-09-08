// StudentDrawerForm.js

import {Drawer, Input, Col, Select, Form, Row, Button, Spin} from 'antd';
import {addNewStudent} from "./client";
import {LoadingOutlined} from "@ant-design/icons";
import {useState} from "react";
import {openSuccessNotification, openErrorNotification} from "./Notification";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;    //for loading indicator when submitting new student
const {Option} = Select;

function StudentDrawerForm({showDrawer, setShowDrawer, fetchStudents}) {
    const onCLose = () => setShowDrawer(false);
    const [submitting, setSubmitting] = useState(false);    //state for when submitting new student

    const onFinish = student => {
        setSubmitting(true)                                     //setSubmitting status to true
        console.log(JSON.stringify(student, null, 2))

        addNewStudent(student)
            .then(() => {
                    console.log("Student Added")
                    onCLose();                                      //close the form once addNewStudent() success

                    openSuccessNotification("Student successfully added",
                        `${student.name} was added to the system`); //Show notification pop-up (from Notification.js)

                    fetchStudents();                                //fetchStudents / page reload after student added
                }
            ).catch(err => {
                console.log(err)
                err.response.json().then(res => {
                    console.log(res);
                    openErrorNotification("There was an Issue", //for error when student email is already taken
                        `${res.message}[${res.status}][${res.error}]`,
                        "bottomLeft"
                    )
                });
            }).finally(() => {
                setSubmitting(false);                           //after student is added, setSubmitting to false
            })
    };

    const onFinishFailed = errorInfo => {
        alert(JSON.stringify(errorInfo, null, 2));
    };

    return <Drawer
        title="Create new student"
        width={720}
        onClose={onCLose}
        visible={showDrawer}
        bodyStyle={{paddingBottom: 80}}
        footer={
            <div
                style={{
                    textAlign: 'right',
                }}
            >
                <Button onClick={onCLose} style={{marginRight: 8}}>
                    Cancel
                </Button>
            </div>
        }
    >
        <Form layout="vertical"
              onFinishFailed={onFinishFailed}
              onFinish={onFinish}
              hideRequiredMark>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{required: true, message: 'Please enter student name'}]}
                    >
                        <Input placeholder="Please enter student name"/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{required: true, message: 'Please enter student email'}]}
                    >
                        <Input placeholder="Please enter student email"/>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="gender"
                        label="gender"
                        rules={[{required: true, message: 'Please select a gender'}]}
                    >
                        <Select placeholder="Please select a gender">
                            <Option value="MALE">MALE</Option>
                            <Option value="FEMALE">FEMALE</Option>
                            <Option value="OTHER">OTHER</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Form.Item >
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                {submitting && <Spin indicator={antIcon} />}
            </Row>
        </Form>
    </Drawer>
}

export default StudentDrawerForm;