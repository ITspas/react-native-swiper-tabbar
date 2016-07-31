'use strict'
import React from 'react';
import {
	StyleSheet,
	Dimensions,
	Animated,
	View,
	Image,
	Text,
	TouchableHighlight,
	PanResponder
} from 'react-native';


let {
	width,
	height
} = Dimensions.get('window');


export default class TabBar extends React.Component {
	constructor(props) {
		super(props);
		let active = 0;
		this.props.children && this.props.children.forEach((e, k) => {
			e.props.active && (active = k);
		});
		this.state = {
			active: active,
			marginLeftAnim: new Animated.Value(0)
		}
		this._index = 0;
		this._marginLeft = 0;
		this._maxMarginLeft = (this.props.children.length - 1) * width;
	}
	componentWillMount() {
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: e => true,
			onMoveShouldSetPanResponder: e => true,
			onPanResponderMove: (e, g) => {
				this._isMove = true;
				this._marginLeft = g.dx + (-this._index * width);
				this._marginLeft > 0 && (this._marginLeft = 0);
				this._marginLeft < (-this._maxMarginLeft) && (this._marginLeft = -this._maxMarginLeft);
				this.setState({
					marginLeftAnim: new Animated.Value(this._marginLeft)
				});
			},
			onPanResponderRelease: (e, g) => {
				if (!this._isMove) return;
				this._index -= Math.abs(g.dx) > (width / 4) ? (1 * g.dx > 0 ? 1 : -1) : 0;
				this._index < 0 && (this._index = 0);
				let len = this.props.children.length - 1;
				this._index > len && (this._index = len);
				this.setState({
					active: this._index,
					marginLeftAnim: new Animated.Value(this._marginLeft)
				})
				setTimeout(() => {
					Animated.spring(this.state.marginLeftAnim, {
						toValue: -this._index * width,
					}).start();
				})
				this._isMove = false;
			}
		})
	}
	componentWillUnmount() {

	}
	scrollTo(idx) {
		this._index = idx;
		this.setState({
			active: idx
		})
		Animated.spring(
			this.state.marginLeftAnim, {
				toValue: -this._index * width
			},
		).start();
	}
	render(){
		let maxWidth = this._maxMarginLeft + width;
		return (
			<View {...this._panResponder.panHandlers} style={{flex:1}}>
				<Animated.View 
                    ref={e=>this._view = e}
                    style={[styles.content,{marginLeft:this.state.marginLeftAnim,width:maxWidth,height:height-55,flexDirection:'row'}]}>
					{this.props.children && this.props.children.map((v,k)=>{
                        return v.props.children
                    })}
				</Animated.View>
				<View style={[styles.tabbar,this.props.style]}>
					{this.props.children && this.props.children.map((e,k)=>{
						return <TabBarItem key={k} {...e.props} active={this.state.active == k} tabbar={this} index={k}/>;
					})}
				</View>
			</View>
		);
	}
}

class TabBarItem extends React.Component{
	onPress(e){
		this.props.tabbar && this.props.tabbar.scrollTo(this.props.index);// setState({active:this.props.index});
		this.props.onPress && this.props.onPress(this);
	}
	render(){
		return(
			<View style={styles.item}>
				<TouchableHighlight onPress={this.onPress.bind(this)} activeOpacity={1} underlayColor='#FFF0'>
					<Image style={styles.item_img} source={this.props.active && this.props.activeIcon ? this.props.activeIcon : this.props.icon} />
				</TouchableHighlight>
				<Text style={[styles.item_txt,this.props.active && {color:this.props.tabbar.props.activeColor}]} suppressHighlighting={true} onPress={this.onPress.bind(this)}>{this.props.title}</Text>
			</View>
		);
	}
}

TabBar.Item = TabBarItem;


const styles = StyleSheet.create({
	tabbar:{
		left:0,
		right:0,
		bottom:0,
		height:55,
		position:'absolute',
		flexDirection:'row',
		backgroundColor:'white',
		borderTopWidth:1,
		borderTopColor:'#DDD'
	},
	item:{
		flex:1,
		alignItems:'center',
		justifyContent:'center'
	},
	item_img:{
		width:32,
		height:32,
		marginTop:4,
	},
	item_txt:{
		marginTop:2,
		fontSize:12,
	},
	content:{
		// flex:1,
		// marginBottom:55
	}
});