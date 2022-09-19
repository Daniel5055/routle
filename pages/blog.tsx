import { readFile } from "fs/promises";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Layout from "../components/common/Layout";
import { Post } from "../utils/types/Post";
import { marked } from "marked";
import parseHtml from "html-react-parser"
import style from "../styles/Blog.module.scss"

const Blog: NextPage = ({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
  <Layout description="Blog Routle">
    <div className={style['post-container']}>
      {posts
        ?.sort((a: Post, b: Post) => b.id - a.id)
        .map((post: Post) => {
          return (
            <div key={post.id} className={style['post']}>
              <h2>{post.title}</h2>
              <h3>{post.date}</h3>
              <hr />
              <div className={style['post-body']}>
                {parseHtml(post.body!)}
              </div>
            </div>
          )
        })
      }
    </div>
    <hr className={style['bottom-line']} />
  </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const posts = await readFile('public/blog/posts.json')
  const parsedPosts: Post[] = JSON.parse(posts.toString());

  const completePosts = await Promise.all(parsedPosts.map(async (post) => {
    const rawBody = await readFile(`public/blog/${post.bodyPath}`);

    const body = await marked(rawBody.toString(), { async: true });
    return { ...post, body};
  }));

  return {
    props: {
      posts: completePosts,
    }
  }
};

export default Blog;
