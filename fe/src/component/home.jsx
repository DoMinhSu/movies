
import React, { Component } from 'react';
import {
    Link
} from "react-router-dom"
import {
    ListView,
    RefreshControl,
    ActivityIndicator,
    SwipeAction,
    Icon
} from 'antd-mobile'
import Dotdotdot from 'react-dotdotdot'
import Util from "../util/Util.js"

export default class Home extends Component {

    constructor(props) {
        super(props)
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => { return r1 !== r2 }
        })
        this._data = []
        this.state = {
            loading: true,
            datasource: ds.cloneWithRows([]),
            noMore: false,
            reflushing: false,
            noData: false,
        }
        this.footer = this.footer.bind(this)
        this.onEndReached = this.onEndReached.bind(this)
        this.onRefresh = this.onRefresh.bind(this)
        this.timer = null
    }

    // componentWillReceiveProps(nextProps) {
    //     const { category, search } = nextProps
    //     console.log(category + "    " + search)
    //     clearTimeout(this.timer)
    //     this.timer = setTimeout(() => {
    //         if (this.state.loading) {
    //             return
    //         }
    //         this.setState({
    //             loading: true
    //         })
    //         let promise
    //         if (category || search) {
    //             promise = Util.fetch('/api/movies/search/by?')
    //         }
    //         if (!category && !search) {
    //             promise = Util.fetch('/api/movies')
    //         }
    //         promise.then(res => {
    //             if (res.data.length) {
    //                 this._data = []
    //                 this.dataRecieve(res.data)
    //             } else {
    //                 this.setState({
    //                     loading: false,
    //                     noData: true
    //                 })
    //             }
    //         })
    //     }, 10)
    // }


    handleQuery(obj) {
        const keys = Object.keys(obj)
        keys.forEach(key => {
            if (!obj[key]) {
                delete obj[key]
            }
        })

    }

    componentDidMount() {
        Util.fetch('/api/movies').then(res => {
            if (res.data.length) {
                this.dataRecieve(res.data)
                return
            }
            this.setState({
                loading: false,
                noData: true
            })
        })
    }

    dataRecieve(data) {
        this._data = this._data.concat(data)
        this.latestTime = this._data[this._data.length - 1].updateTime
        this.setState({
            datasource: this.state.datasource.cloneWithRows(this._data),
            loading: false,
            noData: false
        })
    }



    onEndReached(e) {
        if (this.state.loading || this.state.noMore) {
            return
        }
        this.setState({
            loading: true
        })
        Util.fetch('/api/movies?latest=' + this.latestTime).then(res => {
            if (res.data.length) {
                this.dataRecieve(res.data)
            } else {
                this.setState({
                    loading: false,
                    noMore: true,
                })
            }
        })

    }

    onRefresh() {
        console.log('reflush')
        this.setState({
            reflushing: true
        })
        setTimeout(() => {
            this.setState({
                reflushing: false
            })
        }, 1000)
    }

    row(rowData, sectionId, rowId) {
        return <div className='listview-item' key={rowId}>
            <div className="m-item">
                <SwipeAction autoClose right={
                    [
                        {
                            text: '收藏',
                            onPress: () => { console.log('收藏') },
                            className: 'collection'
                        }
                    ]
                }>
                    <Link to={{
                        pathname: `/detail/${rowData._id}`,
                        state: {
                            title: rowData.title
                        }
                    }}>
                        <img src={rowData.thumb} className="m-item-thumb"></img>
                        <div className="m-item-wrap">
                            <div className="m-item-instruction-props">
                                <span className='label weight'>{rowData.title}</span>
                                <span className='label'>{rowData.type.join('/')}</span>
                                <span className='label'>{rowData.actors.join('/')}</span>
                            </div>
                            <Dotdotdot clamp={4}>
                                <p className="m-item-instruct">
                                    {rowData.instruct}
                                </p>
                            </Dotdotdot>
                        </div>
                    </Link>
                </SwipeAction>
            </div>
            <p className="separator"></p>
        </div>
    }

    footer() {
        return <div className="footer" style={{ textAlign: 'center' }}>
            {(this.state.noMore && this._data.length > 10) ? '没有了' : this.state.loading ? 'Loading...' : ''}
        </div>
    }

    render() {

        return (
            <div>{
                this.state.noData ? <div className='noData'>
                    <Icon type={require('../common/svg/no-data.svg')} size="lg" />
                </div>
                    : <ListView className="listview" dataSource={this.state.datasource}
                        renderRow={this.row}
                        renderFooter={this.footer}
                        onScroll={() => { console.log('scroll'); }}
                        style={{
                            height: (document.documentElement.clientHeight - 110)
                        }}
                        useZscroller
                        pageSize={10}
                        onEndReached={this.onEndReached}
                        onEndReachedThreshold={20}
                        scrollEventThrottle={100}
                        refreshControl={<RefreshControl
                            refreshing={this.state.reflushing}
                            onRefresh={this.onRefresh}
                        />}
                    >
                    </ListView>
            }
            </div>
        )
    }

}