import { useState, useEffect, memo, useContext, createContext } from "react";
import type { FunctionComponent } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import type { NextPage, GetServerSideProps } from "next";
import { Button, Empty, Table, Pagination, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { GithubOutlined } from "@ant-design/icons";
import Skeleton from "./Skeleton";
import Layout from "@/layout/Main";
import Head from "@/utils/Head";
import If from "@/utils/If";
import Article from "@/components/common/Article";
import UserFace from "@/components/common/UserFace";
import type { response, article } from "@/types";
import { Context } from "@/store";
import Error from "./Error";

interface propsType {
  id: string | undefined;
}

interface userResponse {
  email?: string;
  GitHub?: string;
}

interface background {
  title: string;
  url: string;
}

interface userArticleTypes {
  data: article[];
}

const userDataContext = createContext<userResponse>({});

/** 用户加载成功后顶部*/
const Header: FunctionComponent = memo(() => {
  let router = useRouter();

  const [imageData, setImageData] = useState({ url: "", title: "" });
  useEffect(() => {
    axios.get<response<background>>("/user/background").then(res => {
      setImageData(res.data.data);
    });
  }, []);
  const store = useContext(userDataContext);
  const adminGitHub = "https://github.com/Lrunlin";
  return (
    <>
      <style jsx>{`
        .user-header_container {
          background: white;
          margin-bottom: 10px;
        }
        .user-background {
          height: 220px;
          background-image: url(${imageData.url});
        }
        .user-data {
          display: flex;
        }
        h2 {
          font-size: 18px;
          font-weight: 700;
        }
        p {
          color: #939393;
        }
      `}</style>
      <style jsx>
        {`
          .user-github_link {
            color: black;
            margin-left: 10px;
            font-size: 24px;
          }
        `}
      </style>
      <style jsx global>{`
        .user-user-face {
          border-radius: 50%;
          position: relative;
          top: -45px;
          left: 20px;
        }
      `}</style>
      <div className="user-header_container">
        <div className="user-background"></div>
        <div className="user-data">
          <UserFace
            className="user-user-face"
            height={110}
            width={110}
            userId={router.query.id + ""}
          />
          <div style={{ marginLeft: "40px", marginTop: "10px" }}>
            <h2>
              <span>{router.query.id}</span>
              <If if={store.GitHub}>
                <a
                  href={store.email == "admin" ? adminGitHub : store.GitHub}
                  rel="nofollow"
                  target="_blank"
                  className="user-github_link"
                >
                  <GithubOutlined />
                </a>
              </If>
            </h2>
            <p>{imageData.title}</p>
          </div>
        </div>
      </div>
    </>
  );
});
/** 如果是自己的个人中心文章显示表格*/
const UserArticle: FunctionComponent<userArticleTypes> = props => {
  const [data, setData] = useState<article[]>(props.data);
  function removeArticle(id: number) {
    axios.delete<response>(`/article/${id}`).then(res => {
      if (res.data.success) {
        message.success("删除成功");
        setData(arr => arr.filter(item => item.id != id));
      } else {
        message.error("删除失败");
      }
    });
  }
  const columns: ColumnsType<article> = [
    {
      title: "title",
      dataIndex: "title",
      render: (value: string) => (
        <div
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            width: "400px",
          }}
          title={value}
        >
          {value}
        </div>
      ),
    },
    {
      title: "删除",
      dataIndex: "id",
      render: (value:number) => {
        return (
          <Button type="primary" danger onClick={() => removeArticle(value)}>
            删除
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: false,
          position: ["bottomCenter"],
          hideOnSinglePage: true,
        }}
        rowKey="id"
      />

      {/* 为了引入对应的css */}
      {false && <Pagination total={0} />}
    </>
  );
};

/** 用户加载成功后主体*/
const Main: FunctionComponent = () => {
  const [data, setData] = useState<article[]>([]);
  let router = useRouter();
  let store = useContext(Context);

  useEffect(() => {
    axios
      .get<response<article[]>>("/article", { params: { author: router.query.id } })
      .then(res => {
        if (res.data.success) setData(res.data.data);
      });
  }, []);

  return (
    <If if={data.length} else={<Empty description="暂时没有发布文章哦" />}>
      <If if={store.userData.email == router.query.id} else={<Article data={data} />}>
        <UserArticle data={data} />
      </If>
    </If>
  );
};

/** 用户查询成功组件*/
const User: FunctionComponent = () => {
  return (
    <>
      <Header />
      <Main />
    </>
  );
};

const NextPageName: NextPage<propsType> = props => {
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>();
  const [userData, setUserData] = useState<userResponse>({});
  useEffect(() => {
    axios.get<response<userResponse>>(`/user/data/${props.id}`).then(res => {
      setIsSuccess(res.data.success);
      setUserData(res.data.data);
    });
  }, []);

  //设置页面更新强制刷新组件
  const [key, setKey] = useState(1);
  let router = useRouter();
  useEffect(() => {
    setKey(i => ++i);
  }, [router]);

  return (
    <Layout>
      <Head
        title="前端路上-个人中心"
        keyword={["个人中心", "必应壁纸"]}
        description="博客个人中心，查看发布的内容"
      />
      <userDataContext.Provider value={userData}>
        <If if={isSuccess == undefined} else={isSuccess ? <User key={key} /> : <Error />}>
          <Skeleton />
        </If>
      </userDataContext.Provider>
    </Layout>
  );
};
export const getServerSideProps: GetServerSideProps = async ctx => {
  return {
    props: {
      id: ctx?.params?.id,
    },
  };
};
export default NextPageName;
