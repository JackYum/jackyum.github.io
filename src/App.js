import React, {useState} from 'react';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined, SoundOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';


import {Breadcrumb, Layout, Menu, theme, Card, Button} from 'antd';
import {rgba} from "@react-spring/shared";

const {Header, Content, Footer, Sider} = Layout;

function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const items = [
    getItem('Option 1', '1', <PieChartOutlined/>),
    getItem('Option 2', '2', <DesktopOutlined/>),
    getItem('User', 'sub1', <UserOutlined/>, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined/>, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined/>),
];
const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: {colorBgContainer},
    } = theme.useToken();
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical"/>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items}/>
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                />
                <Content
                    style={{
                        margin: '0 16px',
                    }}
                >
                    <Breadcrumb
                        style={{
                            margin: '16px 0',
                        }}
                    >
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                        }}
                    >
                        <WordCard></WordCard>
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                    }}
                >
                    Ant Design ©2023 Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};

function WordCard() {
    handleFileSelect()
    const [word, setWord] = useState("word");
    let total_words = [];
    let kiled_words = [];
    let today_learning_words = [];
    let today_review_words = [];
    let today_learning_and_review_words = [];

    let currentIndex = 0;

// 每天记忆多少个单词
    let learn_count = 120;

    // 获取当前日期（当前时区时间）
    const now = new Date(new Date() - new Date().getTimezoneOffset() * 60000);

// 指定日期
    const targetDate = new Date('2023-08-01');

// 计算时间差,并转化为天数
    const diffTime = now - targetDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));


    let day_number = diffDays
    console.log('day_number', day_number);

    function isInKilledWord(word) {
        return kiled_words.some((subWord) => subWord.word === word.word);
    }

    function getWordsToStudy(allWords, killedWords, dayNumber) {
        // 过滤出未学习的单词
        const notLearnedWords = allWords.filter((word) => !isInKilledWord(word));

        // 计算今天要学习的单词数
        const wordsPerDay = Math.ceil(notLearnedWords.length / dayNumber);

        // 获取今天要学习的单词
        const wordsToStudyToday = notLearnedWords.slice((dayNumber - 1) * learn_count, dayNumber * learn_count);

        return wordsToStudyToday;
    }


    function showWord(index) {
        // 获取单词的文本和链接元素
        const wordElement = document.getElementById('word');
        const wordLinkElement = document.getElementById('wordLink');
        // 设置 Word 链接的文本和目标链接
        wordLinkElement.innerText = today_learning_and_review_words[index].word;
        wordLinkElement.href = `https://m.youdao.com/result?lang=en&word=${encodeURIComponent(today_learning_and_review_words[index].word)}`;

        const audioPlayerUkElement = document.getElementById('audioPlayerUk');
        audioPlayerUkElement.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(today_learning_and_review_words[index].word)}&type=1`
        const audioPlayerUsElement = document.getElementById('audioPlayerUs');
        audioPlayerUsElement.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(today_learning_and_review_words[index].word)}&type=2`

        let new_learned = currentIndex > today_learning_words.length ? today_learning_words.length : currentIndex
        let total_learned = kiled_words.length + (day_number - 1) * learn_count + new_learned
        let review_learned = currentIndex - today_learning_words.length < 0 ? 0 : currentIndex - today_learning_words.length

        document.getElementById('totalWords').innerText = '总量 ' + total_learned + '/' + total_words.length + '，新学 ' + new_learned + '/' + today_learning_words.length + '，复习 ' + review_learned + '/' + today_review_words.length;
        document.getElementById('id').innerText = today_learning_and_review_words[index].id;
        // document.getElementById('word').innerText = today_learning_and_review_words[index].word;

        let pronunciation = today_learning_and_review_words[index].pronunciation
            .replaceAll('[', '/')
            .replaceAll(']', '/')
            .split(' ');
        document.getElementById('pronunciationUk').innerText = pronunciation[0];
        document.getElementById('pronunciationUs').innerText = pronunciation[1];
        document.getElementById('translation').innerText = today_learning_and_review_words[index].translation;
    }


    function parseCSV(csvContent) {
        const lines = csvContent.split(/\r?\n/);
        const parsedWords = [];
        for (const line of lines) {
            // id	word	认识与否	pronounce	chinese
            const [id, word, pronunciation, translation] = line.split(',');
            if (word && translation) {
                // Remove surrounding quotes from the translation field if present
                const cleanTranslation = translation.replace(/^"(.*)"$/, '$1');
                parsedWords.push({id, word, pronunciation, translation: cleanTranslation});
            }
        }
        return parsedWords;
    }

    function handleFileSelect() {
        fetch('data/t_word.csv')
            .then(response => response.text())
            .then(data => {
                // 所有单词
                total_words = parseCSV(data);
                console.log('total_words', total_words);

                if (total_words.length > 0) {
                    // 已斩词
                    fetch('data/killed_words/jack_ren.csv')
                        .then(response => response.text())
                        .then(data => {
                            kiled_words = parseCSV(data);
                            console.log('kiled_words', kiled_words);

                            // 今日要学习的词

                            today_learning_words = getWordsToStudy(total_words, kiled_words, day_number)
                            console.log('today_learning_words', today_learning_words);

                            // 今日要复习的单词
                            // 抽象一个函数：获取第 n 天要学习的单词
                            // in：所有单词，已斩词，第几天，out: 今天要学的单词

                            const daysToSubtract = [1, 2, 4, 7, 15, 30];
                            for (const days of daysToSubtract) {
                                if (day_number > days) {
                                    console.log('push:', days)
                                    const wordsToStudy = getWordsToStudy(total_words, kiled_words, day_number - days);
                                    // 使用了扩展运算符...来将获取的单词数组展开并添加到today_learning_words中。这样，我们避免了重复代码，并且将多个查询合并为一个数组。
                                    today_review_words.push(...wordsToStudy)
                                    // today_learning_and_review_words.push(...wordsToStudy);
                                }
                            }
                            console.log('today_review_words', today_review_words);

                            today_learning_and_review_words.push(...today_learning_words)
                            today_learning_and_review_words.push(...today_review_words)

                            if (today_learning_and_review_words.length > 0) {
                                showWord(0)
                            }


                        })
                        .catch(error => {
                            console.error('Error fetching the CSV file:', error);
                            alert('无法获取CSV文件，请确保服务器已经运行并提供文件！');
                        });
                    // showWord(currentIndex);
                } else {
                    alert('CSV文件格式错误或文件为空！');
                }
            })
            .catch(error => {
                console.error('Error fetching the CSV file:', error);
                alert('无法获取CSV文件，请确保服务器已经运行并提供文件！');
            });
    }

    function showNextWord() {
        currentIndex = currentIndex + 1;
        if (currentIndex >= today_learning_and_review_words.length) {
            alert("已经是最后一个了！")
            currentIndex = currentIndex - 1;
        }
        showWord(currentIndex);
    }

    function showLastWord() {
        currentIndex = currentIndex - 1;
        if (currentIndex < 0) {
            alert("已经是第一个了！")
            currentIndex = 0;
        }
        showWord(currentIndex);
    }

    return (
        <div>
            <div className="return-link">
                <p>Word Card</p>

            </div>
            <Card
                // title="Card title"
                bordered={false}
                // hoverable
                style={{
                    width: 300,
                    height: 500,
                    backgroundColor: 'rgba(51,234,81,0.13)',
                    borderRadius: 10,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                    padding: 40,
                    // max-width: 400px;
                    textAlign: "center",
                    // 使用 grid 布局将按钮居中并固定在底部
                    display: "grid",
                }}
            >

                <div className="card-content">
                    <p id="totalWords" className="id">总单词量</p>

                    <p id="id" className="id">Id</p>
                    <h1 id="word">
                        <a href="#" id="wordLink" target="_blank">Word</a>
                    </h1>

                    <div className="pronunciation-content">
                        <p id="pronunciationUk">Pronunciation</p>
                        <button id="playUk" className="play">
                            <SoundOutlined/>
                        </button>
                        <p id="pronunciationUs">Pronunciation</p>
                        <button id="playUs" className="play">
                            <SoundOutlined/>
                        </button>
                        <audio id="audioPlayerUk" src="https://dict.youdao.com/dictvoice?audio=hello&type=1"></audio>
                        <audio id="audioPlayerUs" src="https://dict.youdao.com/dictvoice?audio=hello&type=2"></audio>
                    </div>

                    <p id="translation">Translation</p>
                    <div className="button-wrapper">
                        <Button id="lastButton" type="primary" onClick={showLastWord}>上一个</Button>
                        <Button id="nextButton" type="primary" onClick={showNextWord}>下一个</Button>
                    </div>


                </div>
            </Card>
        </div>
    )
};

export default App;