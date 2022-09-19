import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Layout from "../components/common/Layout";

const Blog: NextPage = ({
  hello,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
    <Layout description="Blog Routle">
        <h1>
            {hello}
        </h1>
    </Layout>
    )
}

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {
            hello: "hello",
        }
    }
};

export default Blog;