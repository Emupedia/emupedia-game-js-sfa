﻿var AnimationTrail = function(animations,zIndex,delay)
{
    this.FollowElement = null;
    this.Trail = [];
    this.Delay = delay || 12;
    this.Enabled = false;
    this.StageDeltaX = 0;
    this.StageDeltaY = 0;
}


AnimationTrail.prototype.Add = function(animation)
{
    var img = window.document.createElement("img");
    img.className = "player";

    var div = window.document.createElement("div");
    div.className = "player";
    div.appendChild(img);

    this.Trail[this.Trail.length] = {StartFrame:0,Element:div,Animation:animation,FrameIndex:0,LastImageSrc:"",Coords:[]};
}


AnimationTrail.prototype.Disable = function()
{
    if(!!this.Enabled)
    {
        this.StageDeltaX = 0;
        this.StageDeltaY = 0;

        this.Enabled = false;

        for(var i = 0, length = this.Trail.length; i < length; ++i)
        {
            this.FollowElement.parentNode.removeChild(this.Trail[i].Element);
            this.Trail[i].Element.children[0].src = "";
            this.Trail[i].FrameIndex = 0;
        }
    }
}


AnimationTrail.prototype.Enable = function(frame,followElement)
{
    if(!this.Enabled)
    {
        this.StageDeltaX = 0;
        this.StageDeltaY = 0;

        this.FollowElement = this.FollowElement || followElement;
        var container = this.FollowElement.parentNode;
        for(var i = 0, length = this.Trail.length; i < length; ++i)
        {
            this.Trail[i].Animation.ClearAllFrameUserData();
            if(container.children.length == 0)
                container.appendChild(this.Trail[i].Element);
            else
                container.insertBefore(this.Trail[i].Element,container.children[0]);
            this.Trail[i].StartFrame = frame + (this.Delay * (i + 1));
            this.Trail[i].FrameIndex = 0;
        }
        this.Enabled = true;
    }
}

/*returns the current frame for the trail*/
AnimationTrail.prototype.GetCurrentFrame = function(index)
{
    return this.Trail[index].Animation.baseAnimation_.frames_[this.Trail[index].FrameIndex];
}
/**/
AnimationTrail.prototype.FrameMove = function(frame,index,direction,stageX,stageY)
{
    if(this.Enabled)
    {
        for(var i = 0, length = this.Trail.length; i < length; ++i)
        {
            this.Trail[i].Animation.AddUserDataToFrame(index, 
                {
                    Frame:frame
                    ,Left:this.FollowElement.style.left
                    ,Right:this.FollowElement.style.right
                    ,Bottom:this.FollowElement.style.bottom
                    ,Top:this.FollowElement.style.top
                    ,DeltaX:0
                    ,DeltaY:0
                });
            if(frame > this.Trail[i].StartFrame)
            {
                var currentItem = this.Trail[i];

                /*get the current frame*/
                /*var delta = frame - currentItem.StartFrame;
                var frameToRender = currentItem.Animation.GetFrame(delta);*/

                if(!currentItem.Animation.HasUserData(currentItem.FrameIndex))
                    ++currentItem.FrameIndex;
                var frameToRender = this.GetCurrentFrame(i);


                if(!!frameToRender)
                {
                    var src = frameToRender.GetImageSrc(direction);
                    if(!!src && (currentItem.LastImageSrc != src))
                    {
                        currentItem.LastImageSrc = src;
                        currentItem.Element.children[0].src = frameImages_.Get(src).src;
                    }
                }
            }
        }
    }
}


/*The trail is applying the exact coords of the player, but the screen may move, which must be applied to all trail coords!*/
AnimationTrail.prototype.ApplyStageOffset = function(stageDiffX,stageDiffY)
{
    if(!!stageDiffX)
    {
        for(var trailIndex = 0, nbTrails = this.Trail.length; trailIndex < nbTrails; trailIndex++)
        {
            for(var frameIndex = 0, nbFrames = this.Trail[trailIndex].Animation.baseAnimation_.frames_.length; frameIndex < nbFrames; ++frameIndex)
            {
                var frame = this.Trail[trailIndex].Animation.baseAnimation_.frames_[frameIndex];
                var coords = frame.UserData;
                for(var coordIndex = 0, nbCoords = coords.length; coordIndex < nbCoords; coordIndex++)
                    coords[coordIndex].DeltaX += stageDiffX;
            }
        }
    }

    if(!!stageDiffY)
    {
        for(var i = 0, length = this.Trail.length; i < length; i++)
        {
        }
    }

}

/*returns the first coordinate at the requested frame index*/
AnimationTrail.prototype.GetNextCoord = function(index)
{
    /*get the current frame*/
    var retVal =  null;
    var frameToRender = this.GetCurrentFrame(index);
    if(!!frameToRender)
    {
        var tmp = frameToRender.UserData.splice(0,1);
        retVal = tmp[0];
    }
    return retVal;
}

AnimationTrail.prototype.Render = function(frame,stageDiffX,stageDiffY)
{
    if(this.Enabled)
    {
        /*The trail is applying the exact coords of the player, but the screen may move, which must be applied to all trail coords!*/
        this.ApplyStageOffset(stageDiffX,stageDiffY);
            
        for(var i = 0, length = this.Trail.length; i < length; i++)
        {
            if(frame > this.Trail[i].StartFrame)
            {
                var coords = this.GetNextCoord(i);
                if(!!coords)
                {
                    this.Trail[i].Element.style.left = (!!coords.Left) ? coords.DeltaX + parseInt(coords.Left) + "px" : "";
                    this.Trail[i].Element.style.right = (!!coords.Right) ? coords.DeltaX + parseInt(coords.Right) + "px" : "";
                    this.Trail[i].Element.style.bottom = (!!coords.Bottom) ? coords.DeltaY + parseInt(coords.Bottom) + "px" : "";
                    this.Trail[i].Element.style.top = (!!coords.Top) ? coords.DeltaY + parseInt(coords.Top) + "px" : "";
                }
            }
        }
    }
}