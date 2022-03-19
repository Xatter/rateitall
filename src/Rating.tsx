import React from 'react';

interface StarProps {
    selected: Boolean
};

function Star(props: StarProps) {
    return <span>I am a {props.selected ? "selected" : ""} star</span>;
}

interface RatingProps {
    rating: Number
}

export default class Rating extends React.Component<RatingProps> {
    render() {
        return <span>
            <Star selected={this.props.rating > 0} />
            <Star selected={this.props.rating > 1} />
            <Star selected={this.props.rating > 2} />
            <Star selected={this.props.rating > 3} />
            <Star selected={this.props.rating > 4} />
        </span>;
    }
}