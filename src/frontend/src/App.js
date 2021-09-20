import {useState, useEffect} from 'react';
import {deleteStudent, getAllStudents} from "./client";
import {
    Layout,
    Menu,
    Breadcrumb,
    Table, Spin, Empty, Button, Badge, Tag, Avatar, Popconfirm, Radio, Divider
} from 'antd'; //copied from https://ant.design/components/layout/ (sider)

import StudentDrawerForm from "./StudentDrawerForm";
import './App.css';

import {
    DesktopOutlined,
    PieChartOutlined,
    FileOutlined,
    TeamOutlined,
    UserOutlined,
    LoadingOutlined, PlusOutlined
} from '@ant-design/icons';
import {openErrorNotification, openSuccessNotification} from "./Notification"; //npm install --save @ant-design/icons@4.6.2, within 'frontend' folder (4.6.2 can be viewed from package.json)

const { Header, Content, Footer, Sider } = Layout;  //copied from https://ant.design/components/layout/ (sider)
const { SubMenu } = Menu;                           //copied from https://ant.design/components/layout/ (sider)

const TheAvatar = ({name}) => {
    let trim = name.trim();
    if (trim.length === 0) {
        return <Avatar icon={<UserOutlined/>}/> //return default-user-icon, if there is no name
    }

    const split = trim.split(" ");  //split the name, determining the number of words in name
    if(split.length === 1){
        return <Avatar>{name.charAt(0)}</Avatar>    //give first letter when there is one word in name
    }
    return <Avatar>{`${name.charAt(0)}${name.charAt(name.length-1)}`}</Avatar>    //give first and last letter of name when multiple words in name
}

const removeStudent = (studentId, callback) => {
    deleteStudent(studentId).then(() => {   //from client.js deleteStudent()
            openSuccessNotification("Student deleted", `Student ${studentId} is deleted`);
            callback();
        })
        .catch(err => {     //for logging the response error and opening notification on the error status
        console.log(err.response)
        err.response.json().then(res => {
            console.log(res);
            openErrorNotification("There was an Issue",
                `${res.message}[${res.status}][${res.error}]`
            )
        });
    });
}

const columns = fetchStudents => [
    {
      title: '',
      dataIndex: 'avatar',
      key: 'avatar',
        render: (text, student) =>
            <TheAvatar name={student.name}/>
    },
    {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Gender',
        dataIndex: 'gender',    //map to data source
        key: 'gender',
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (text, student) =>
            <Radio.Group>
                <Popconfirm
                    placement='topRight'
                    title={`Are you sure to delete ${student.name}`}
                    onConfirm={() => removeStudent(student.id, fetchStudents)}
                    okText='Yes'
                    cancelText='No'>
                    <Radio.Button value="small">Delete</Radio.Button>
                </Popconfirm>
                <Radio.Button value={"small"}>Edit</Radio.Button>
            </Radio.Group>
    }
];  //copied from https://ant.design/components/table/

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;  //copied from https://ant.design/components/spin/

function App() {

    //state variables are preserved by React.
    //'students' type which will hold the initial value(s) for that instance of students.
    //'setStudents' is executed during a particular point in the component’s lifecycle to update the value(s) of the students.
    //When we declare a state variable with useState, it returns a pair — an array with two items.
    //The first item is the current value,
    //and the second is a function that lets us update it.
    const[students, setStudents] = useState([]);
    const[collapsed, setCollapsed] = useState(false);
    const[fetching, setFetching] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);

    const fetchStudents = () =>
        getAllStudents()    //imported from ./client.js
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setStudents(data);
                //setFetching(false);
                })
            .catch(err => {     //for logging the response error and opening notif on the error status
                    console.log(err.response)
                    err.response.json().then(res => {
                            console.log(res);
                            openErrorNotification("There was an Issue",
                                `${res.message}[${res.status}][${res.error}]`
                            )
                    });
                }).finally(() => setFetching(false))

    useEffect(() => {
        console.log("component is mounted");
        fetchStudents()
    }, []); //run this as soon as the component is mounted / page load

    const renderStudents = () => {
        if(fetching){
            return <Spin indicator={antIcon} /> //copied from https://ant.design/components/spin/
                                                //when it is fetching students, show loading spin
        }

        if(students.length <= 0){
            return <>
                <Button
                    onClick={() => setShowDrawer(!showDrawer)}
                    type="primary" shape="round" icon={<PlusOutlined/>} size="small">
                    Add New Student
                </Button>
                <StudentDrawerForm
                    showDrawer={showDrawer}
                    setShowDrawer={setShowDrawer}
                    fetchStudents={fetchStudents}
                />
                <Empty/>
            </>
        }
        return<>
            <StudentDrawerForm
                showDrawer={showDrawer}
                setShowDrawer={setShowDrawer}
                fetchStudents={fetchStudents}  //providing fetchStudents to StudentDrawerForm.js for data refresh once student added
            />
            <Table
                dataSource={students}
                columns={columns(fetchStudents)}
                bordered
                title={() =>
                    <>
                        <Tag>Number of students</Tag>
                        <Badge
                            className="site-badge-count-109"
                            count={students.length}
                        />
                        <br/><br/>
                        <Button
                            onClick={() => setShowDrawer(!showDrawer)}  //when button is clicked, reverse the status of showDrawer
                            type="primary" shape="round" icon={<PlusOutlined/>} size="small">
                            Add New Student
                        </Button>
                    </>
                }
                pagination={{pageSize: 50}}
                scroll={{y: 500}}
                rowKey={student => student.id}
            />
        </>
    }


    //copied from https://ant.design/components/layout/ (sider)
    return <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed}
               onCollapse={setCollapsed}>
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                <Menu.Item key="1" icon={<PieChartOutlined />}>
                    Option 1
                </Menu.Item>
                <Menu.Item key="2" icon={<DesktopOutlined />}>
                    Option 2
                </Menu.Item>
                <SubMenu key="sub1" icon={<UserOutlined />} title="User">
                    <Menu.Item key="3">Tom</Menu.Item>
                    <Menu.Item key="4">Bill</Menu.Item>
                    <Menu.Item key="5">Alex</Menu.Item>
                </SubMenu>
                <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
                    <Menu.Item key="6">Team 1</Menu.Item>
                    <Menu.Item key="8">Team 2</Menu.Item>
                </SubMenu>
                <Menu.Item key="9" icon={<FileOutlined />}>
                    Files
                </Menu.Item>
            </Menu>
        </Sider>
        <Layout className="site-layout">
            <Header className="site-layout-background" style={{ padding: 0 }} />
            <Content style={{ margin: '0 16px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>User</Breadcrumb.Item>
                    <Breadcrumb.Item>Bill</Breadcrumb.Item>
                </Breadcrumb>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                    {renderStudents()}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                By Conrad Lee ©2021 Created by Ant UED
                <Divider>
                    <a
                        rel="noopener noreferrer"
                        target="_blank" //enables to open a new tab when link is clicked
                        href="https://www.linkedin.com/in/crdl93">
                        Click here to view my Linkedin profile
                    </a>
                </Divider>
            </Footer>
        </Layout>
    </Layout>
}

export default App;
