# Reproduce: Rscript analysis/market-analysis.R (working directory: project root)
options(stringsAsFactors=FALSE)
d <- read.csv('public-data/JTSJOL.csv', na.strings=c('', '.', 'NA'))
stopifnot(all(c('observation_date','JTSJOL') %in% names(d)))
d$date <- as.Date(d$observation_date); d$value <- as.numeric(d$JTSJOL)
stopifnot(!anyNA(d$date),!anyDuplicated(d$date),!anyNA(d$value))
d <- d[order(d$date),]; stopifnot(all(format(d$date, '%d')=='01'))
# Check monthly continuity, do not silently bridge missing months.
stopifnot(identical(as.character(seq(d$date[1],d$date[nrow(d)],by='month')),as.character(d$date)))
for(k in 1:12)d[[paste0('lag',k)]] <- c(rep(NA,k),head(d$value,-k))
x <- d[complete.cases(d),]; n <- nrow(x); n1 <- floor(n*.6); n2 <- floor(n*.2)
x$split <- c(rep('train',n1),rep('validation',n2),rep('test',n-n1-n2))
train <- x[x$split=='train',]; validation <- x[x$split=='validation',]; test <- x[x$split=='test',]
mae <- function(a,b)mean(abs(a-b)); rmse<-function(a,b)sqrt(mean((a-b)^2))
fit <- function(dat,p)lm(as.formula(paste('value ~',paste(paste0('lag',1:p),collapse=' + '))),data=dat)
candidates <- list(); valRows <- list()
for(p in c(1,3,12)) {m<-fit(train,p); pred<-as.numeric(predict(m,validation)); name<-paste0('AR(',p,')');candidates[[name]]<-p; valRows[[name]]<-data.frame(model=name,MAE=mae(validation$value,pred),RMSE=rmse(validation$value,pred))}
valRows[['Last month']]<-data.frame(model='Last month',MAE=mae(validation$value,validation$lag1),RMSE=rmse(validation$value,validation$lag1))
v <- do.call(rbind,valRows); selected<-v$model[which.min(v$MAE)]
# Model choice locked by validation MAE. Refit once on train + validation.
combined<-x[x$split!='test',]; finalModel<-if(selected=='Last month')NULL else fit(combined,candidates[[selected]])
pred<-if(is.null(finalModel))test$lag1 else as.numeric(predict(finalModel,test))
metrics<-data.frame(model=c(selected,'Last month baseline'),MAE=c(mae(test$value,pred),mae(test$value,test$lag1)),RMSE=c(rmse(test$value,pred),rmse(test$value,test$lag1)))
forecast<-data.frame(date=as.character(test$date),actual=test$value,predicted=pred,baseline=test$lag1,error=pred-test$value)
write.csv(x[,c('observation_date','value','split',paste0('lag',1:12))],'analysis/dataset-splits.csv',row.names=FALSE)
write.csv(v,'analysis/validation-metrics.csv',row.names=FALSE);write.csv(metrics,'analysis/test-metrics.csv',row.names=FALSE);write.csv(forecast,'analysis/test-predictions.csv',row.names=FALSE)
# Small base-R JSON writer: no package installation required.
json <- function(z){if(is.data.frame(z))return(paste0('[',paste(vapply(seq_len(nrow(z)),function(i)json(as.list(z[i,,drop=FALSE])),''),collapse=','),']'));if(is.list(z)){if(!is.null(names(z)))return(paste0('{',paste(paste0(vapply(names(z),json,''),':',vapply(z,json,'')),collapse=','),'}'));return(paste0('[',paste(vapply(z,json,''),collapse=','),']'))};if(length(z)>1)return(paste0('[',paste(vapply(as.list(z),json,''),collapse=','),']'));if(length(z)==0||is.na(z))return('null');if(is.logical(z))return(tolower(as.character(z)));if(is.numeric(z))return(format(z,digits=12,scientific=FALSE,trim=TRUE));s<-gsub('\\','\\\\',as.character(z),fixed=TRUE);s<-gsub('"','\\"',s,fixed=TRUE);s<-gsub('\n','\\n',s,fixed=TRUE);paste0('"',s,'"')}
splits<-lapply(c('train','validation','test'),function(part){a<-x[x$split==part,];list(name=part,count=nrow(a),start=as.character(min(a$date)),end=as.character(max(a$date)))})
report<-list(source='U.S. Bureau of Labor Statistics via FRED',series='JTSJOL',units='Thousands, seasonally adjusted',sourceUrl='https://fred.stlouisfed.org/series/JTSJOL',downloadDate='2026-10-28',rawCount=nrow(d),usableCount=nrow(x),selected=selected,validation=v,test=metrics,splits=splits,history=data.frame(date=as.character(d$date),value=d$value),predictions=forecast,Rversion=R.version.string,design='Chronological 60/20/remaining; one-step-ahead evaluation using observed lagged values; latest revised data, not a real-time vintage backtest')
writeLines(paste0('window.publicMarketAnalysis = ',json(report),';'),'analysis/market-results.js',useBytes=TRUE)
writeLines(c(capture.output(sessionInfo()),'',capture.output(v),'',capture.output(metrics)), 'analysis/run-log.txt')
print(v);print(metrics);cat('Selected:',selected,'; raw:',nrow(d),'; usable:',n,'\n')
