import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { target } from '~target'
import { makeBookmark } from '~data/selectors/bookmarks'
import { makeCollection } from '~data/selectors/collections'

import Reader from '~co/screen/splitview/reader'
import Header from './header'
import Content from './content'
import AccentColor from '~co/collections/item/accentColor'

class MyReader extends React.Component {
    static defaultProps = {
        query: {} //bookmark, tab
    }

    state = {
        fullscreen: false
    }

    handlers = {
        onFullscreenToggleClick: ()=>
            this.setState({ fullscreen: !this.state.fullscreen }),

        setTab: (tab)=>
            this.props.history.replace(
                this.props.getLink({ tab })
            )
    }

    render() {
        const { item, _id, font_color, tab } = this.props
        const { fullscreen } = this.state

        return (
            <AccentColor _id={_id}>{style=>
                <Reader 
                    show={item._id?true:false}
                    fullscreen={fullscreen}
                    data-theme={tab=='preview' && item.type == 'article' && font_color ? font_color : undefined}
                    style={style}>
                    <Header {...this.props} {...this.handlers} />
                    <Content {...this.props} />
                </Reader>
            }</AccentColor>
        )
    }
}

export default connect(
    ()=>{
        const getBookmark = makeBookmark()
        const getCollection = makeCollection()

        return (state, { query: { tab, bookmark } })=>{
            const item = getBookmark(state, parseInt(bookmark))
            const { access } = getCollection(state, item.collectionId)

            //available tabs
            const tabs = [
                ...target != 'extension' ? ['preview'] : [], 
                ...access.level>=3?['edit']:[], 
                ...item.cache && access.level>=3?['cache']:[],
            ]

            return {
                item,
                tab: tabs.includes(tab) ? tab : tabs[0],
                tabs,
                access,
                font_color: state.config.font_color
            }
        }
    }
)(
    withRouter(
        MyReader
    )
)